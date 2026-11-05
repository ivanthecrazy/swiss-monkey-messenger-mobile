import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// Which backend a build talks to, by build mode. `vite build` is production;
// `vite build --mode staging` (npm run *:staging) is staging. `vite` (dev server,
// mode development) uses staging, so local browser runs never touch production data.
const ORIGINS = {
  production: "https://platform.swissmonkey.io",
  staging: "https://staging.swissmonkey.io",
} as const;
type AppEnv = keyof typeof ORIGINS;

// Writes the bundle's environment to dist/app-env.txt. The iOS build phase and the
// Android build both read it from the synced bundle and fail when it doesn't match
// the app being built (production app vs `.staging` app) — see README "Staging builds".
const appEnvMarker = (appEnv: AppEnv): Plugin => ({
  name: "app-env-marker",
  apply: "build",
  generateBundle() {
    this.emitFile({ type: "asset", fileName: "app-env.txt", source: `${appEnv}\n` });
  },
});

// Capacitor serves the built `dist` from the app bundle (capacitor:// on iOS,
// https://localhost on Android), so a standard SPA build works — no Tauri host wiring.
export default defineConfig(({ mode }) => {
  if (mode !== "production" && mode !== "staging" && mode !== "development") {
    throw new Error(`Unknown build mode "${mode}": use production, staging or development.`);
  }
  const appEnv: AppEnv = mode === "production" ? "production" : "staging";

  // SENTRY_* from the shell or a gitignored .env.local. SENTRY_DSN turns error
  // reporting on (src/services/sentry.ts). With SENTRY_AUTH_TOKEN too, release
  // builds upload source maps (matched to events by debug ID, so no release
  // bookkeeping) and then delete them, so they're never bundled into the app.
  // Without a token, no source maps are generated at all.
  // VITE_PLATFORM_ORIGIN (shell or .env.local) overrides the backend, e.g. a local server.
  // @ts-expect-error process is a nodejs global
  const env = { ...loadEnv(mode, process.cwd(), ["SENTRY_", "VITE_"]), ...process.env };
  const uploadSourceMaps = mode !== "development" && Boolean(env.SENTRY_AUTH_TOKEN);
  const platformOrigin = (env.VITE_PLATFORM_ORIGIN || ORIGINS[appEnv]).replace(/\/+$/, "");

  return {
    plugins: [
      react(),
      appEnvMarker(appEnv),
      uploadSourceMaps &&
        sentryVitePlugin({
          authToken: env.SENTRY_AUTH_TOKEN,
          org: env.SENTRY_ORG || "swiss-monkey-tf",
          project: env.SENTRY_PROJECT || "messenger-mobile",
          release: { create: false },
          // Don't send Sentry usage data about the plugin itself.
          telemetry: false,
          sourcemaps: { filesToDeleteAfterUpload: ["dist/**/*.map"] },
          // A Sentry outage shouldn't fail a release build.
          errorHandler: (err) => console.warn("[sentry-vite-plugin] non-fatal:", err.message),
        }),
    ],
    define: {
      __SENTRY_DSN__: JSON.stringify(env.SENTRY_DSN ?? ""),
      __APP_ENV__: JSON.stringify(appEnv),
      __PLATFORM_ORIGIN__: JSON.stringify(platformOrigin),
    },
    build: {
      sourcemap: uploadSourceMaps ? "hidden" : false,
    },
    server: { port: 1420 },
  };
});
