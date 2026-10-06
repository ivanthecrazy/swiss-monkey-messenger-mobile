import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// Capacitor serves the built `dist` from the app bundle (capacitor:// on iOS,
// https://localhost on Android), so a standard SPA build works — no Tauri host wiring.
export default defineConfig(({ mode }) => {
  // SENTRY_* from the shell or a gitignored .env.local. SENTRY_DSN turns error
  // reporting on (src/services/sentry.ts). With SENTRY_AUTH_TOKEN too, production
  // builds upload source maps (matched to events by debug ID, so no release
  // bookkeeping) and then delete them, so they're never bundled into the app.
  // Without a token, no source maps are generated at all.
  // @ts-expect-error process is a nodejs global
  const env = { ...loadEnv(mode, process.cwd(), "SENTRY_"), ...process.env };
  const uploadSourceMaps = mode === "production" && Boolean(env.SENTRY_AUTH_TOKEN);

  return {
    plugins: [
      react(),
      uploadSourceMaps &&
        sentryVitePlugin({
          authToken: env.SENTRY_AUTH_TOKEN,
          org: env.SENTRY_ORG || "swiss-monkey-tf",
          project: env.SENTRY_PROJECT || "messenger-mobile",
          release: { create: false },
          sourcemaps: { filesToDeleteAfterUpload: ["dist/**/*.map"] },
          // A Sentry outage shouldn't fail a release build.
          errorHandler: (err) => console.warn("[sentry-vite-plugin] non-fatal:", err.message),
        }),
    ],
    define: {
      __SENTRY_DSN__: JSON.stringify(env.SENTRY_DSN ?? ""),
    },
    build: {
      sourcemap: uploadSourceMaps ? "hidden" : false,
    },
    server: { port: 1420 },
  };
});
