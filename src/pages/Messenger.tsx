import { useEffect, useRef, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  ChatProvider, ChatsList, Conversation, fetchChats, triggerUnreadChatsLoadedEvent,
} from "@regimenthq/messenger-core";
import { startMessenger, stopMessenger } from "../messenger/bootstrap.ts";
import { getTokenStore } from "@regimenthq/shell-auth";
import UserBlock from "../components/UserBlock.tsx";
import ChatSearchBar, { ChatSearch } from "../components/ChatSearchBar.tsx";
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
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const openChat = (chatId: number) => {
    setSelectedChatId(chatId);
    setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, unread: false } : c)));
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
        return prev.map((c) => (
          c.id === message.chat_id && c.id !== selectedChatId ? { ...c, unread: true } : c
        ));
      });
    };
    window.addEventListener("newChatStarted", onNewChat);
    window.addEventListener("chatMessageReceived", onMessage);
    return () => {
      window.removeEventListener("newChatStarted", onNewChat);
      window.removeEventListener("chatMessageReceived", onMessage);
    };
  }, [selectedChatId]);

  const onListScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    if (totalPages < 2 || page >= totalPages || loading) return;
    const el = e.currentTarget;
    if (el.scrollHeight - el.clientHeight - el.scrollTop > 150) return;
    await loadChats(page + 1);
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
              <Typography sx={{ fontWeight: 700, fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {titleFor(selectedChat)}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <Conversation chat={selectedChat} />
            </Box>
          </>
        ) : (
          <>
            <UserBlock />
            <ChatSearchBar isAdmin={isAdmin} value={search} onChange={setSearch} />
            <Box
              sx={{ flex: 1, overflowY: "auto", p: 2, "& .MuiList-root": { p: 0 } }}
              onScroll={onListScroll}
            >
              <ChatsList
                chats={chats}
                selectedChatId={selectedChatId}
                onChatSelected={(chat) => openChat(chat.id)}
              />
            </Box>
          </>
        )}
      </Box>
    </ChatProvider>
  );
};

export default Messenger;
