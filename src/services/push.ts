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

const sendToken = async (token: string) => {
  await authPost("device_tokens", {
    token,
    platform: Capacitor.getPlatform(), // "ios" | "android"
    client: "messenger",
  });
  registeredToken = token;
};

// Ask for permission, register the token, and keep it fresh. `onOpenChat` is
// invoked when the user taps a notification (the chat id rides in FCM `data`).
export const registerPush = async (onOpenChat?: (chatId: number) => void) => {
  if (!Capacitor.isNativePlatform()) return;

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
      if (chatId && onOpenChat) onOpenChat(chatId);
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
