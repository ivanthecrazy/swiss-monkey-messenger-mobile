import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Capacitor } from "@capacitor/core";
// Lato is the Swiss Monkey brand font; the messenger theme sets it as fontFamily.
// Bundled via @fontsource so it works offline.
import "@fontsource/lato/300.css";
import "@fontsource/lato/400.css";
import "@fontsource/lato/700.css";
import "@fontsource/lato/900.css";
// The messenger composer uses react-quill; its stylesheet isn't bundled by the
// package, so the host loads it.
import "react-quill/dist/quill.snow.css";
import App from "./App.tsx";
import { configureAuth, getTokenStore } from "@regimenthq/shell-auth";
import { API_BASE, getAppVersion } from "./services/config.ts";

// Configure the shared auth layer once, before the app mounts. `client: "messenger"`
// so the platform treats it like the desktop messenger (any user type, its own
// version floor). Token storage uses the default localStorage store, which persists
// in the Capacitor WebView — secure (Keychain/Keystore) storage is a follow-up.
configureAuth({
  apiBaseUrl: API_BASE,
  client: "messenger",
  deviceName: `Mobile (${Capacitor.getPlatform()})`,
  getAppVersion,
  onUnauthorized: () => {
    getTokenStore().clear();
    window.location.href = "/login";
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
