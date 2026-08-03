import { Capacitor } from "@capacitor/core";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import { authDelete, authPost } from "@regimenthq/shell-auth";

// Native push registration. Both platforms hand back an FCM token (Firebase
// relays to iOS via APNs), which we register against the signed-in user so the
// backend's SendMobilePushesJob can reach this device.
//
// No-ops in the browser, so `npm run dev` is unaffected.

let registeredToken: string | null = null;
let listenersBound = false;

// The current "open this chat" handler and a buffer for a tap that arrives before
// one is set (cold start: the OS can deliver the launch tap before the UI has
// registered its handler). The buffered tap is flushed as soon as a handler binds.
let openHandler: ((chatId: number) => void) | null = null;
let pendingChatId: number | null = null;

const handleTap = (chatId: number) => {
  if (openHandler) openHandler(chatId);
  else pendingChatId = chatId;
};

// A stable id for this install, persisted in localStorage (survives app restarts
// and token rotation; cleared only on uninstall/data-clear). The backend upserts
// device tokens on this, so a rotated FCM token updates this device's single row
// instead of piling up extra rows — which caused duplicate notifications.
const INSTALLATION_ID_KEY = "sm_installation_id";

const getInstallationId = (): string => {
  let id = localStorage.getItem(INSTALLATION_ID_KEY);
  if (!id) {
    id = (crypto as { randomUUID?: () => string })?.randomUUID?.()
      ?? `inst-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(INSTALLATION_ID_KEY, id);
  }
  return id;
};

const sendToken = async (token: string) => {
  await authPost("device_tokens", {
    token,
    platform: Capacitor.getPlatform(), // "ios" | "android"
    client: "messenger",
    installation_id: getInstallationId(),
  });
  registeredToken = token;
};

// Ask for permission, register the token, and keep it fresh. `onOpenChat` is
// invoked when the user taps a notification (the chat id rides in FCM `data`).
export const registerPush = async (onOpenChat?: (chatId: number) => void) => {
  if (!Capacitor.isNativePlatform()) return;

  // Keep the handler current across remounts, then flush a tap that landed before
  // it was ready (the launch tap on a cold start).
  openHandler = onOpenChat ?? null;
  if (openHandler && pendingChatId != null) {
    const id = pendingChatId;
    pendingChatId = null;
    openHandler(id);
  }

  try {
    const { receive } = await FirebaseMessaging.requestPermissions();
    if (receive !== "granted") return;

    const { token } = await FirebaseMessaging.getToken();
    if (token) await sendToken(token);

    if (listenersBound) return;
    listenersBound = true;

    // FCM rotates tokens; keep the backend in sync.
    await FirebaseMessaging.addListener("tokenReceived", async ({ token: next }) => {
      if (next && next !== registeredToken) {
        try {
          await sendToken(next);
        } catch {
          /* retried on next launch */
        }
      }
    });

    // Tapping the notification opens its chat. The plugin types `data` as `{}`,
    // so narrow it — FCM data values are always strings.
    await FirebaseMessaging.addListener("notificationActionPerformed", (event) => {
      const data = event.notification?.data as Record<string, string> | undefined;
      const chatId = Number(data?.chat_id);
      if (chatId) handleTap(chatId);
    });
  } catch (error) {
    // Permission denied, or push isn't configured for this build — the app still
    // works, it just won't receive notifications.
    // eslint-disable-next-line no-console
    console.error("Push registration failed:", error);
  }
};

// Called on logout so this device stops receiving the previous user's messages.
export const unregisterPush = async () => {
  if (!registeredToken) return;

  try {
    await authDelete(`device_tokens?token=${encodeURIComponent(registeredToken)}`);
  } catch {
    /* the token is re-pointed on the next login anyway */
  }
  registeredToken = null;
};
