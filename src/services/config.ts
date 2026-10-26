import { Capacitor } from "@capacitor/core";

// Backend endpoints. Swap to staging/local as needed.
// export const PLATFORM_ORIGIN = "http://localhost:3000";
export const PLATFORM_ORIGIN = "https://staging.swissmonkey.io";
// export const PLATFORM_ORIGIN = "https://platform.swissmonkey.io";

// Trailing slash: auth requests concatenate this directly (e.g. `${API_URL}login`).
export const API_URL = `${PLATFORM_ORIGIN}/api/`;

// No trailing slash: passed to the messenger's configureChatApi as an axios
// baseURL, which combines it with `/chats` etc. -> `${API_BASE}/chats`.
export const API_BASE = `${PLATFORM_ORIGIN}/api`;

export const CABLE_URL = `${PLATFORM_ORIGIN.replace(/^http/, "ws")}/cable`;

// How this app identifies itself on every request — shell-auth's and the chat
// client's alike. The server picks its minimum-version floor from client +
// platform (desktop and mobile share "messenger" but number their releases
// independently; iOS and Android share one mobile floor, so keep their version
// numbers in sync), and hides features this build can't render by version.
// getPlatform() is "web" in a browser, which the server ignores, falling back
// to the shared floor.
export const CLIENT = "messenger";
export const PLATFORM = Capacitor.getPlatform();

let appVersion = "0.2.0";
export const getAppVersion = () => appVersion;
export const setAppVersion = (version: string) => {
  appVersion = version;
};
