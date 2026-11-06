import { Capacitor } from "@capacitor/core";

// Backend endpoints, fixed at build time by vite.config.ts from the build mode:
// `npm run sync` -> production, `npm run sync:staging` -> staging. To point a
// build at a local server, set VITE_PLATFORM_ORIGIN (e.g. http://localhost:3000).
// The native build checks the bundle's environment matches its own (production
// app vs the staging one), so a staging bundle can't ship in the store app.
export const APP_ENV = __APP_ENV__;
export const PLATFORM_ORIGIN = __PLATFORM_ORIGIN__;

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
