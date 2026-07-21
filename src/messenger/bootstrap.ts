import { createConsumer } from "@rails/actioncable";
import {
  configureChatApi,
  configureMessenger,
  subscribeToUserChannel,
} from "@regimenthq/messenger-core";
import { authGet, getTokenStore } from "@regimenthq/shell-auth";
import { API_BASE, CABLE_URL } from "../services/config.ts";

// Implements the host/shell contract from the package README: point the REST
// client at /api with the token, open a token-authed cable consumer, wire the
// feature flags, and route real-time payloads. Call start() after login, stop()
// on logout / window teardown.

let cable: ReturnType<typeof createConsumer> | null = null;
let unsubscribe: (() => void) | null = null;

// Applied synchronously at startup and used as the fallback if the server config
// fetch fails, so the messenger flag getters never read undefined.
const DEFAULT_FLAGS = {
  enableMessagePins: true,
  hideMessageThreads: false,
  enableMentions: true,
};

type ServerConfig = {
  enable_message_pins?: boolean;
  hide_message_threads?: boolean;
  enable_mentions?: boolean;
};

// Pull the messenger feature flags from the platform (GET /api/config) so the
// desktop honors the same ENABLE_MESSAGE_PINS / HIDE_MESSAGE_THREADS /
// ENABLE_MENTIONS the web app does. On any failure or unexpected body we keep
// DEFAULT_FLAGS, which startMessenger() has already applied.
const loadFeatureFlags = async () => {
  try {
    const cfg = await authGet<ServerConfig>("config");
    if (typeof cfg.enable_message_pins !== "boolean") return;
    configureMessenger({
      enableMessagePins: cfg.enable_message_pins,
      hideMessageThreads: cfg.hide_message_threads === true,
      enableMentions: cfg.enable_mentions === true,
      // No org context in the desktop shell; only used for the web deep-link.
      currentOrganization: null,
    });
  } catch {
    // Keep DEFAULT_FLAGS.
  }
};

export const startMessenger = () => {
  const token = getTokenStore().getToken();
  if (!token) return;

  configureChatApi({ baseURL: API_BASE, token });

  // Apply defaults immediately (getters never read undefined), then refine from
  // the server so the desktop tracks the platform's actual feature flags.
  configureMessenger({ ...DEFAULT_FLAGS, currentOrganization: null });
  loadFeatureFlags();

  cable = createConsumer(`${CABLE_URL}?token=${encodeURIComponent(token)}`);
  // OS notifications are raised at the message level in useMessageNotifications
  // (mentions arrive as messages), so this callback is just a hook for any
  // future mention-specific handling.
  unsubscribe = subscribeToUserChannel(cable, {
    onMention: () => {},
  });
};

export const stopMessenger = () => {
  if (unsubscribe) unsubscribe();
  if (cable) cable.disconnect();
  unsubscribe = null;
  cable = null;
};
