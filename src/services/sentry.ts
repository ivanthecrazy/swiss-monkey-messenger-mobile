import { Capacitor } from "@capacitor/core";
import * as Sentry from "@sentry/capacitor";
import { init as reactInit } from "@sentry/react";
import type { Breadcrumb } from "@sentry/react";
import { createLocalStorageTokenStore, setTokenStore } from "@regimenthq/shell-auth";

// Error reporting: JS errors from the web view plus native iOS/Android crashes
// (@sentry/capacitor starts the native SDKs and keeps their scope in sync). The
// release comes from the native app (`io.swissmonkey.chat@<version>+<build>`), and
// source maps are matched by debug ID (see vite.config.ts), so neither is set here.
// The DSN is baked in at build time from SENTRY_DSN; without one, Sentry stays off.

// Message bodies are patient-adjacent, so keep breadcrumbs to what explains a
// crash: drop plain console.log/info/debug output (it can echo API payloads) and
// strip query strings, which carry search terms.
const stripQuery = (url: unknown) => (typeof url === "string" ? url.split("?")[0] : url);

const scrubBreadcrumb = (breadcrumb: Breadcrumb): Breadcrumb | null => {
  if (breadcrumb.category === "console" && !["warning", "error"].includes(breadcrumb.level ?? "")) {
    return null;
  }
  if (breadcrumb.data) {
    for (const key of ["url", "from", "to"]) {
      if (key in breadcrumb.data) breadcrumb.data[key] = stripQuery(breadcrumb.data[key]);
    }
  }
  return breadcrumb;
};

// Tag events with the signed-in user's id (id only — no name or email). Wraps the
// default token store so login and logout update Sentry wherever they happen.
const trackSignedInUser = () => {
  const store = createLocalStorageTokenStore();
  const identify = (user: { id?: number } | null) => Sentry.setUser(user?.id ? { id: String(user.id) } : null);

  setTokenStore({
    ...store,
    setUser: (user) => {
      store.setUser(user);
      identify(user);
    },
    clear: () => {
      store.clear();
      identify(null);
    },
  });
  identify(store.getUser());
};

export const initSentry = () => {
  // `npm run dev` in a browser has no native side.
  if (!__SENTRY_DSN__ || !Capacitor.isNativePlatform()) return;

  Sentry.init(
    {
      dsn: __SENTRY_DSN__,
      environment: import.meta.env.DEV ? "development" : "production",
      sendDefaultPii: false,
      beforeBreadcrumb: scrubBreadcrumb,
    },
    reactInit,
  );
  trackSignedInUser();
};
