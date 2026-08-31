// @regimenthq/messenger-core ships as JS (no types). Loose declarations so the
// TypeScript build resolves it. Tighten these as the integration stabilises.
declare module "@regimenthq/messenger-core" {
  import { ComponentType, ReactNode } from "react";

  export const ChatProvider: ComponentType<{ currentUser: unknown; children: ReactNode }>;
  export const ChatsList: ComponentType<{
    chats: any[];
    onChatSelected: (chat: any) => void;
    selectedChatId: number | null;
    // Optional pinned row above the list (the task assistant tab). Null hides it.
    topItem?: { title?: string; subtitle?: string } | null;
    topItemSelected?: boolean;
    onTopItemSelected?: () => void;
  }>;
  export const Conversation: ComponentType<{
    chat: any;
    onMessageReceived?: (message: any) => void;
    allowReopen?: boolean;
    hideZoomMeetingButton?: boolean;
    // Scrolls to this message and flashes it once the timeline has loaded,
    // fetching older pages if it isn't on the first one.
    focusMessageId?: number | null;
    // Suppress the Conversation's own header title (the shell shows it elsewhere).
    hideTitle?: boolean;
  }>;

  export type AssistantTask = {
    id: number;
    signal: string;
    description: string;
    detected_at: string;
    due_at: string | null;
    chat_id: number;
    source_message_id: number;
    group: { key: string; label: string; kind: string };
  };

  export type AssistantTasksData = {
    enabled: boolean;
    tasks: AssistantTask[];
    open_count: number;
    signals: { key: string; summary: string }[];
    limits: string[];
    copy: {
      tab_title: string;
      explainer_title: string;
      empty_title: string;
      empty_body: string;
    };
  };

  // All wording arrives in `data` from the server — never hardcode it in a shell,
  // since the signal list reflects what is actually running for that user.
  export const AssistantTasksPanel: ComponentType<{
    data: AssistantTasksData;
    onOpenSource: (chatId: number, messageId: number) => void;
    onTasksChanged: (remaining: AssistantTask[]) => void;
  }>;

  export function useAssistantTasks(): {
    enabled: boolean;
    data: AssistantTasksData | null;
    tasks: AssistantTask[];
    openCount: number;
    topItem: { title?: string; subtitle?: string } | null;
    reload: () => Promise<void>;
    onTasksChanged: (remaining: AssistantTask[]) => void;
  };

  export function configureChatApi(opts: { baseURL?: string; token?: string }): void;
  export function configureMessenger(config: Record<string, unknown>): void;
  export function subscribeToUserChannel(
    consumer: unknown,
    handlers?: { onMention?: (m: any) => void; onCvExtraction?: (c: any) => void },
  ): () => void;
  export function fetchChats(page?: number, search?: Record<string, unknown>): Promise<any>;
  export const TeamDialog: ComponentType<{
    open: boolean;
    onClose: () => void;
    team?: any;
    onSaved?: (chat: any) => void;
  }>;
  export function triggerUnreadChatsLoadedEvent(count: number): void;

  // Grouped chat list (announcements / org threads / teams / support) + Contact
  // support button. Self-contained: fetches /chats/grouped and refetches on events.
  export const GroupedChatsList: ComponentType<{
    currentUser: unknown;
    selectedChatId: number | null;
    onChatSelected: (chat: any) => void;
    refreshSignal?: number;
  }>;

  // The Alerts inbox. Navigation is delegated to the host.
  export const NotificationsList: ComponentType<{
    currentUserId?: number;
    onOpenChat?: (chatId: number, messageId?: number) => void;
    onOpenUrl?: (path: string) => void;
    onUnreadChange?: (count: number) => void;
    hideHeader?: boolean;
  }>;

  // Tabbed search results (Conversations + Messages). Host owns the input.
  export const SearchResultsPanel: ComponentType<{
    query: string;
    currentUser: unknown;
    onOpenChat?: (chatId: number, messageId?: number) => void;
  }>;

  // "All Files" across the user's conversations. Downloads delegated to the host.
  export const FilesList: ComponentType<{
    onOpenUrl?: (url: string) => void;
    hideHeader?: boolean;
  }>;
}

declare module "@rails/actioncable" {
  export function createConsumer(url: string): {
    disconnect: () => void;
    subscriptions: any;
  };
}
