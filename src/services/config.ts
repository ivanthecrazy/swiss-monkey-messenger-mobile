// Backend endpoints. Swap to staging/local as needed.
// export const PLATFORM_ORIGIN = "http://localhost:3000";
// export const PLATFORM_ORIGIN = "https://staging.swissmonkey.io";
export const PLATFORM_ORIGIN = "https://staging.swissmonkey.io";

// Trailing slash: auth requests concatenate this directly (e.g. `${API_URL}login`).
export const API_URL = `${PLATFORM_ORIGIN}/api/`;

// No trailing slash: passed to the messenger's configureChatApi as an axios
// baseURL, which combines it with `/chats` etc. -> `${API_BASE}/chats`.
export const API_BASE = `${PLATFORM_ORIGIN}/api`;

export const CABLE_URL = `${PLATFORM_ORIGIN.replace(/^http/, "ws")}/cable`;

let appVersion = "0.2.0";
export const getAppVersion = () => appVersion;
export const setAppVersion = (version: string) => {
  appVersion = version;
};
