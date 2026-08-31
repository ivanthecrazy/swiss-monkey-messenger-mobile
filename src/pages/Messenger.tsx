import { useEffect, useRef, useState, ReactNode } from "react";
import {
  Box, Button, CircularProgress, IconButton, InputBase, Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import CloseRoundedIcon from "@mui/icons-material/Close";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import {
  AssistantTasksPanel, ChatProvider, ChatsList, Conversation, TeamDialog, fetchChats,
  triggerUnreadChatsLoadedEvent, useAssistantTasks,
  GroupedChatsList, NotificationsList, SearchResultsPanel, FilesList,
} from "@regimenthq/messenger-core";
import { startMessenger, stopMessenger, ensureMessengerClient } from "../messenger/bootstrap.ts";
import { getTokenStore, authGet } from "@regimenthq/shell-auth";
import UserBlock from "../components/UserBlock.tsx";
import PullToRefresh from "../components/PullToRefresh.tsx";
import BottomNav, { MessengerTab } from "../components/BottomNav.tsx";
import { registerPush } from "../services/push.ts";
import { PLATFORM_ORIGIN } from "../services/config.ts";

// Single-pane mobile messenger. A bottom nav switches between the Chats (grouped
// list + search), Alerts, and Files tabs; tapping a chat pushes the conversation
// over everything, and the back arrow returns. The grouped list, alerts, search,
// and files are shared components from messenger-core — the same code the desktop
// shell runs — so the two stay in sync.
const Messenger = () => {
  // Configure the API client now, during render — the self-loading messenger-core
  // components fetch in their mount effects, which fire before this component's
  // mount effect. Doing it only in startMessenger (an effect) would send that first
  // /chats/grouped request to the app origin instead of /api. Idempotent.
  ensureMessengerClient();

  const currentUser = getTokenStore().getUser();
  const currentUserId = (currentUser as { id?: number } | null)?.id;
  const isAdmin = Boolean((currentUser as { admin?: boolean } | null)?.admin);

  const [tab, setTab] = useState<MessengerTab>("chats");
  const [searchQuery, setSearchQuery] = useState("");
  const [alertsUnread, setAlertsUnread] = useState(0);
  // Bumped to force the grouped list to refetch (pull-to-refresh).
  const [groupRefresh, setGroupRefresh] = useState(0);

  // Working set behind the open conversation. The grouped list and search fetch
  // their own data; this list just resolves the selected chat (and is warmed with
  // the user's recent chats so opening one is instant).
  const [chats, setChats] = useState<any[]>([]);
  const chatsRef = useRef(chats);
  chatsRef.current = chats;
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [openingChat, setOpeningChat] = useState(false);

  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<any>(null);

  const assistantTasks = useAssistantTasks();
  const [tasksOpen, setTasksOpen] = useState(false);
  const [focusMessageId, setFocusMessageId] = useState<number | null>(null);

  // Chats already marked read on the server this session (see the desktop shell for
  // the full rationale) — keeps a stale unread:true from a list fetch in flight from
  // putting the dot back on a chat just cleared.
  const readChatIdsRef = useRef<Set<number>>(new Set());
  const applyKnownReads = (chat: any) => (
    readChatIdsRef.current.has(chat.id) ? { ...chat, unread: false } : chat
  );

  const markRead = (chatId: number) => setChats(
    (prev) => prev.map((c) => (c.id === chatId ? { ...c, unread: false } : c)),
  );

  // Open a chat by id. Fast path when it's already in the working set; otherwise
  // fetch it on the fly. `focus` is the message to land on.
  const openChat = async (chatId: number, focus: number | null = null) => {
    setTasksOpen(false);
    setFocusMessageId(focus);
    setSelectedChatId(chatId);

    if (chatsRef.current.some((c) => c.id === chatId)) {
      markRead(chatId);
      return;
    }

    setOpeningChat(true);
    try {
      const data = await authGet(`chats/${chatId}`) as { chat?: any } | null;
      const chat = data?.chat;
      if (chat) {
        setChats((prev) => (prev.some((c) => c.id === chat.id)
          ? prev.map((c) => (c.id === chat.id ? { ...chat, unread: false } : c))
          : [{ ...chat, unread: false }, ...prev]));
      } else {
        setSelectedChatId(null);
      }
    } catch {
      setSelectedChatId(null);
    } finally {
      setOpeningChat(false);
    }
  };

  const onTeamSaved = (chat: any) => {
    setChats((prev) => {
      const exists = prev.some((c) => c.id === chat.id);
      return exists ? prev.map((c) => (c.id === chat.id ? { ...c, ...chat } : c)) : [chat, ...prev];
    });
    setSelectedChatId(chat.id);
  };

  // Warm the working set + drive the unread badge. Merges (doesn't replace) so a
  // chat openChat added that isn't in this recent page is never dropped.
  const loadWorkingSet = async () => {
    const data = await fetchChats(1, { q: "" });
    if (!data?.chats) return;
    triggerUnreadChatsLoadedEvent(data.total_unread);
    const fetched = data.chats.map(applyKnownReads);
    setChats((prev) => {
      const ids = new Set(fetched.map((c: any) => c.id));
      return [...fetched, ...prev.filter((c) => !ids.has(c.id))];
    });
  };

  const refresh = async () => {
    setGroupRefresh((n) => n + 1);
    await loadWorkingSet();
  };

  useEffect(() => {
    startMessenger();
    registerPush((chatId) => openChat(chatId));
    loadWorkingSet();
    return () => stopMessenger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onNewChat = (e: any) => {
      const { chat } = e.detail;
      setChats((prev) => {
        const existing = prev.find((c) => c.id === chat.id);
        return existing ? prev.map((c) => (c.id === chat.id ? chat : c)) : [chat, ...prev];
      });
    };
    const onMessage = (e: any) => {
      const { message } = e.detail;
      const seen = message.chat_id === selectedChatId && document.visibilityState !== "hidden";
      if (!seen) readChatIdsRef.current.delete(message.chat_id);
      setChats((prev) => {
        const existing = prev.find((c) => c.id === message.chat_id);
        if (!existing) return message.chat ? [message.chat, ...prev] : prev;
        const now = new Date().toISOString();
        return prev.map((c) => (
          c.id === message.chat_id ? { ...c, last_message_time: now, unread: !seen } : c
        ));
      });
    };
    const onChatRead = (e: any) => {
      const { chatId } = e.detail;
      readChatIdsRef.current.add(chatId);
      setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, unread: false } : c)));
    };
    const onRemoved = (e: any) => {
      const { id } = e.detail;
      readChatIdsRef.current.delete(id);
      setChats((prev) => prev.filter((c) => c.id !== id));
      setSelectedChatId((cur) => (cur === id ? null : cur));
    };
    window.addEventListener("newChatStarted", onNewChat);
    window.addEventListener("chatMessageReceived", onMessage);
    window.addEventListener("chatRead", onChatRead);
    window.addEventListener("chatRemoved", onRemoved);
    return () => {
      window.removeEventListener("newChatStarted", onNewChat);
      window.removeEventListener("chatMessageReceived", onMessage);
      window.removeEventListener("chatRead", onChatRead);
      window.removeEventListener("chatRemoved", onRemoved);
    };
  }, [selectedChatId]);

  const selectedChat = chats.find((c) => c.id === selectedChatId);
  const showTasksPanel = tasksOpen && assistantTasks.enabled;

  const titleFor = (chat: any): string => {
    if (!chat) return "";
    if (chat.display_name) return chat.display_name;
    if (chat.support) return "Swiss Monkey Support";
    const other = chat.users?.find((u: any) => u.id !== currentUserId);
    return other?.name || chat.job?.title || "Chat";
  };

  const openPlatformUrl = (path: string) => { window.open(`${PLATFORM_ORIGIN}${path}`, "_blank"); };
  const openFile = (url: string) => { window.open(url, "_blank"); };

  const backHeader = (onBack: () => void, title?: string, right?: ReactNode) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.5, borderBottom: "1px solid #EBEBF1", flexShrink: 0 }}>
      <IconButton onClick={onBack} aria-label="Back" edge="start"><ArrowBackIcon /></IconButton>
      {/* flex:1 so it also acts as a spacer, keeping `right` aligned to the end when
          there's no title. */}
      <Typography sx={{ flex: 1, fontWeight: 700, fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {title}
      </Typography>
      {right}
    </Box>
  );

  return (
    <ChatProvider currentUser={currentUser}>
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxSizing: "border-box",
          bgcolor: "#FFFFFF",
          pt: "env(safe-area-inset-top)",
          pb: "env(safe-area-inset-bottom)",
        }}
      >
        {showTasksPanel ? (
          <>
            {backHeader(() => setTasksOpen(false))}
            <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              {assistantTasks.data && (
                <AssistantTasksPanel
                  data={assistantTasks.data}
                  onOpenSource={(chatId, messageId) => openChat(chatId, messageId)}
                  onTasksChanged={assistantTasks.onTasksChanged}
                />
              )}
            </Box>
          </>
        ) : selectedChat ? (
          <>
            {backHeader(
              () => setSelectedChatId(null),
              titleFor(selectedChat),
              isAdmin && selectedChat.kind === "team" ? (
                <Button size="small" onClick={() => { setTeamToEdit(selectedChat); setTeamDialogOpen(true); }}>
                  Manage
                </Button>
              ) : undefined,
            )}
            <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              {/* Title lives in the back bar above; hide the Conversation's own. */}
              <Conversation chat={selectedChat} focusMessageId={focusMessageId} hideTitle />
            </Box>
          </>
        ) : openingChat ? (
          <>
            {backHeader(() => { setSelectedChatId(null); setOpeningChat(false); })}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1.5, color: "#88888C" }}>
              <CircularProgress size={28} />
              <Typography sx={{ fontSize: 14 }}>Opening chat…</Typography>
            </Box>
          </>
        ) : (
          <>
            <UserBlock />
            <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              {tab === "chats" && (
                <>
                  {/* Search + (admin) new team */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, pt: 1, pb: 0.5 }}>
                    <Box sx={{ flex: 1, height: 40, display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#FDFDFE", border: "1px solid #EBEBF1", borderRadius: "8px", px: "12px" }}>
                      <SearchIcon sx={{ fontSize: 18, color: "#88888C" }} />
                      <InputBase
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search chats & messages…"
                        sx={{ flex: 1, fontFamily: "Lato", fontSize: 15, "& input": { p: 0 } }}
                      />
                      {searchQuery && (
                        <IconButton onClick={() => setSearchQuery("")} size="small" aria-label="Clear search" sx={{ p: "2px" }}>
                          <CloseRoundedIcon sx={{ fontSize: 16, color: "#88888C" }} />
                        </IconButton>
                      )}
                    </Box>
                    {isAdmin && (
                      <IconButton
                        onClick={() => { setTeamToEdit(null); setTeamDialogOpen(true); }}
                        aria-label="New team"
                        sx={{ width: 40, height: 40, flexShrink: 0, border: "1px solid #EBEBF1", borderRadius: "8px", color: "#45454B" }}
                      >
                        <GroupAddIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  {searchQuery.trim() ? (
                    <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                      <SearchResultsPanel
                        query={searchQuery}
                        currentUser={currentUser}
                        onOpenChat={(chatId, messageId) => openChat(chatId, messageId ?? null)}
                      />
                    </Box>
                  ) : (
                    <PullToRefresh onRefresh={refresh} sx={{ flex: 1, p: 2, "& .MuiList-root": { p: 0 } }}>
                      {assistantTasks.topItem && (
                        <ChatsList
                          chats={[]}
                          selectedChatId={selectedChatId}
                          onChatSelected={(chat) => openChat(chat.id)}
                          topItem={assistantTasks.topItem}
                          topItemSelected={tasksOpen}
                          onTopItemSelected={() => { setTasksOpen(true); setSelectedChatId(null); }}
                        />
                      )}
                      <GroupedChatsList
                        currentUser={currentUser}
                        selectedChatId={selectedChatId}
                        onChatSelected={(chat) => openChat(chat.id)}
                        refreshSignal={groupRefresh}
                      />
                    </PullToRefresh>
                  )}
                </>
              )}

              {tab === "alerts" && (
                <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", p: 2 }}>
                  <NotificationsList
                    currentUserId={currentUserId}
                    onOpenChat={(chatId, messageId) => openChat(chatId, messageId ?? null)}
                    onOpenUrl={openPlatformUrl}
                    onUnreadChange={setAlertsUnread}
                  />
                </Box>
              )}

              {tab === "files" && (
                <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", p: 2 }}>
                  <FilesList onOpenUrl={openFile} />
                </Box>
              )}
            </Box>
            <BottomNav tab={tab} onChange={setTab} alertsUnread={alertsUnread} />
          </>
        )}
      </Box>

      {isAdmin && (
        <TeamDialog
          open={teamDialogOpen}
          onClose={() => setTeamDialogOpen(false)}
          team={teamToEdit}
          onSaved={onTeamSaved}
        />
      )}
    </ChatProvider>
  );
};

export default Messenger;
