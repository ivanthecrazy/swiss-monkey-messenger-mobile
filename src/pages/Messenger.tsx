import { useEffect, useRef, useState } from "react";
import {
  Box, Button, CircularProgress, IconButton, Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  ChatProvider, ChatsList, Conversation, TeamDialog, fetchChats, triggerUnreadChatsLoadedEvent,
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

  const markRead = (chatId: number) => setChats(
    (prev) => prev.map((c) => (c.id === chatId ? { ...c, unread: false } : c)),
  );

  // Open a chat by id. Fast path when it's already loaded; otherwise (e.g. a
  // notification tap while the chat isn't in the list, or a cold start) fetch it
  // on the fly, showing a loading state, then select it.
  const openChat = async (chatId: number) => {
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
      setChats((prev) => (nextPage > 1 ? [...prev, ...data.chats] : data.chats));
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
      setChats((prev) => {
        const existing = prev.find((c) => c.id === message.chat_id);
        if (!existing) return message.chat ? [message.chat, ...prev] : prev;
        // Bump last_message_time so the chat surfaces to the top by recency (the
        // list orders by recency, not unread). Mark unread unless it's open.
        const now = new Date().toISOString();
        return prev.map((c) => (
          c.id === message.chat_id
            ? { ...c, last_message_time: now, unread: c.id !== selectedChatId }
            : c
        ));
      });
    };
    const onRemoved = (e: any) => {
      const { id } = e.detail;
      setChats((prev) => prev.filter((c) => c.id !== id));
      setSelectedChatId((cur) => (cur === id ? null : cur));
    };
    window.addEventListener("newChatStarted", onNewChat);
    window.addEventListener("chatMessageReceived", onMessage);
    window.addEventListener("chatRemoved", onRemoved);
    return () => {
      window.removeEventListener("newChatStarted", onNewChat);
      window.removeEventListener("chatMessageReceived", onMessage);
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
        {selectedChat ? (
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
              <Conversation chat={selectedChat} />
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
