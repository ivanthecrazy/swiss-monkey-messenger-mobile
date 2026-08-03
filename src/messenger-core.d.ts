// @regimenthq/messenger-core ships as JS (no types). Loose declarations so the
// TypeScript build resolves it. Tighten these as the integration stabilises.
declare module "@regimenthq/messenger-core" {
  import { ComponentType, ReactNode } from "react";

  export const ChatProvider: ComponentType<{ currentUser: unknown; children: ReactNode }>;
  export const ChatsList: ComponentType<{
    chats: any[];
    onChatSelected: (chat: any) => void;
    selectedChatId: number | null;
  }>;
  export const Conversation: ComponentType<{
    chat: any;
    onMessageReceived?: (message: any) => void;
    allowReopen?: boolean;
    hideZoomMeetingButton?: boolean;
  }>;

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
}

declare module "@rails/actioncable" {
  export function createConsumer(url: string): {
    disconnect: () => void;
    subscriptions: any;
  };
}
