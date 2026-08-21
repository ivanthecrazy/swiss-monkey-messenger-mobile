import { useEffect, useRef, useState } from "react";
import {
  Box, Button, CircularProgress, IconButton, Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  AssistantTasksPanel, ChatProvider, ChatsList, Conversation, TeamDialog, fetchChats,
  triggerUnreadChatsLoadedEvent, useAssistantTasks,
} from "@regimenthq/messenger-core";
import { startMessenger, stopMessenger } from "../messenger/bootstrap.ts";
import { getTokenStore, authGet } from "@regimenthq/shell-auth";
import UserBlock from "../components/UserBlock.tsx";
import ChatSearchBar, { ChatSearch } from "../components/ChatSearchBar.tsx";
import PullToRefresh from "../components/PullToRefresh.tsx";
import { registerPush } from "../services/push.ts";

// Single-pane mobile messenger: the chat list is full-screen, tapping a chat pushes
// the conversation over it, and the back arrow returns to the list. Data-loading
// (search, pagination, live window events) mirrors the desktop shell.
const Messenger = () => {
  const currentUser = getTokenStore().getUser();
  const isAdmin = Boolean((currentUser as { admin?: boolean } | null)?.admin);

  const [search, setSearch] = useState<ChatSearch>(
    isAdmin
      ? { q: "", chat_filter: "All", chat_type: "", unread_only: false, empty: "Hide" }
      : { q: "" },
  );
  const searchRef = useRef(search);
  searchRef.current = search;

  const [chats, setChats] = useState<any[]>([]);
  // Ref mirror so openChat (invoked from the push callback's stale closure) can
  // read the latest loaded chats.
  const chatsRef = useRef(chats);
  chatsRef.current = chats;
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [openingChat, setOpeningChat] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<any>(null);

  // Open items we noticed in this user's conversations. On a single-pane phone the
  // panel pushes over the list exactly like a conversation does, with the same back
  // arrow. Off unless the user has the flag.
  const assistantTasks = useAssistantTasks();
  const [tasksOpen, setTasksOpen] = useState(false);
  // Message to land on when a task is opened from the panel.
  const [focusMessageId, setFocusMessageId] = useState<number | null>(null);

  // Chats already marked read on the server this session. Conversation marks a chat
  // read as it opens, which can overlap a list fetch still in flight — without this
  // the response's stale unread: true would put the dot back on a chat just cleared.
  // It matters most on the notification-tap path, where the two happen together.
  const readChatIdsRef = useRef<Set<number>>(new Set());
  const applyKnownReads = (chat: any) => (
    readChatIdsRef.current.has(chat.id) ? { ...chat, unread: false } : chat
  );

  // Optimistic local echo only. Clearing it on the server belongs to Conversation,
  // which knows the chat is actually open and on screen, and confirms via `chatRead`.
  const markRead = (chatId: number) => setChats(
    (prev) => prev.map((c) => (c.id === chatId ? { ...c, unread: false } : c)),
  );

  // Open a chat by id. Fast path when it's already loaded; otherwise (e.g. a
  // notification tap while the chat isn't in the list, or a cold start) fetch it
  // on the fly, showing a loading state, then select it.
  // `focus` is the message to land on, and defaults to none: without clearing it,
  // picking a different chat afterwards would try to jump to a message id from the
  // previous conversation and report it as missing.
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
        setSelectedChatId(null); // gone / no access — fall back to the list
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

  const loadChats = async (nextPage: number) => {
    setLoading(true);
    try {
      const data = await fetchChats(nextPage, searchRef.current);
      if (!data.chats) return;
      triggerUnreadChatsLoadedEvent(data.total_unread);
      const fetched = data.chats.map(applyKnownReads);
      setChats((prev) => (nextPage > 1 ? [...prev, ...fetched] : fetched));
      setTotalPages(data.total_pages);
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startMessenger();
    // Register for push once we're authenticated; tapping a notification opens
    // its chat. No-ops in the browser.
    registerPush((chatId) => openChat(chatId));
    return () => stopMessenger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadChats(1), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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
      // Only a chat that's open *and* on screen counts as read — Conversation clears
      // it on the server under exactly that condition, and fires `chatRead` once the
      // app is foregrounded again. A message arriving while the app is backgrounded
      // (the normal state on a phone) must leave the dot on.
      const seen = message.chat_id === selectedChatId && document.visibilityState !== "hidden";
      if (!seen) readChatIdsRef.current.delete(message.chat_id);

      setChats((prev) => {
        const existing = prev.find((c) => c.id === message.chat_id);
        if (!existing) return message.chat ? [message.chat, ...prev] : prev;
        // Bump last_message_time so the chat surfaces to the top by recency (the
        // list orders by recency, not unread).
        const now = new Date().toISOString();
        return prev.map((c) => (
          c.id === message.chat_id
            ? { ...c, last_message_time: now, unread: !seen }
            : c
        ));
      });
    };
    // The server confirmed a chat is read (Conversation marks it on open, and again
    // as messages arrive while it's on screen) — drop the dot to match.
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

  const onListScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    if (totalPages < 2 || page >= totalPages || loading) return;
    const el = e.currentTarget;
    if (el.scrollHeight - el.clientHeight - el.scrollTop > 150) return;
    await loadChats(page + 1);
  };

  // Manual reload: re-fetch the first page with the current filters.
  const refresh = async () => {
    setRefreshing(true);
    try {
      await loadChats(1);
    } finally {
      setRefreshing(false);
    }
  };

  const selectedChat = chats.find((c) => c.id === selectedChatId);
  // Claims the screen as soon as the tab is opened, before the fetch lands, so it
  // never flashes the list again first.
  const showTasksPanel = tasksOpen && assistantTasks.enabled;

  const titleFor = (chat: any): string => {
    if (!chat) return "";
    if (chat.display_name) return chat.display_name; // org thread / announcements / job assistant
    if (chat.support) return "Swiss Monkey Support";
    const other = chat.users?.find((u: any) => u.id !== (currentUser as { id?: number } | null)?.id);
    return other?.name || chat.job?.title || "Chat";
  };

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
          // Keep content clear of the notch / home indicator.
          pt: "env(safe-area-inset-top)",
          pb: "env(safe-area-inset-bottom)",
        }}
      >
        {showTasksPanel ? (
          <>
            <Box
              sx={{
                display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.5,
                borderBottom: "1px solid #EBEBF1", flexShrink: 0,
              }}
            >
              <IconButton onClick={() => setTasksOpen(false)} aria-label="Back" edge="start">
                <ArrowBackIcon />
              </IconButton>
            </Box>
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
            <Box
              sx={{
                display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.5,
                borderBottom: "1px solid #EBEBF1", flexShrink: 0,
              }}
            >
              <IconButton onClick={() => setSelectedChatId(null)} aria-label="Back" edge="start">
                <ArrowBackIcon />
              </IconButton>
              <Typography sx={{ flex: 1, fontWeight: 700, fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {titleFor(selectedChat)}
              </Typography>
              {isAdmin && selectedChat.kind === "team" && (
                <Button size="small" onClick={() => { setTeamToEdit(selectedChat); setTeamDialogOpen(true); }}>
                  Manage
                </Button>
              )}
            </Box>
            <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <Conversation chat={selectedChat} focusMessageId={focusMessageId} />
            </Box>
          </>
        ) : openingChat ? (
          // A chat is being opened (e.g. from a notification tap) but isn't loaded
          // yet — show a spinner with a back affordance so the user is never stuck.
          <>
            <Box
              sx={{
                display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.5,
                borderBottom: "1px solid #EBEBF1", flexShrink: 0,
              }}
            >
              <IconButton
                onClick={() => { setSelectedChatId(null); setOpeningChat(false); }}
                aria-label="Back"
                edge="start"
              >
                <ArrowBackIcon />
              </IconButton>
            </Box>
            <Box sx={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 1.5, color: "#88888C",
            }}
            >
              <CircularProgress size={28} />
              <Typography sx={{ fontSize: 14 }}>Opening chat…</Typography>
            </Box>
          </>
        ) : (
          <>
            <UserBlock />
            <ChatSearchBar
              isAdmin={isAdmin}
              value={search}
              onChange={setSearch}
              onNewTeam={() => { setTeamToEdit(null); setTeamDialogOpen(true); }}
              onRefresh={refresh}
              refreshing={refreshing}
            />
            <PullToRefresh
              onRefresh={refresh}
              onScroll={onListScroll}
              sx={{ flex: 1, p: 2, "& .MuiList-root": { p: 0 } }}
            >
              <ChatsList
                chats={chats}
                selectedChatId={selectedChatId}
                onChatSelected={(chat) => openChat(chat.id)}
                topItem={assistantTasks.topItem}
                topItemSelected={tasksOpen}
                onTopItemSelected={() => { setTasksOpen(true); setSelectedChatId(null); }}
              />
            </PullToRefresh>
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
