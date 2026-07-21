import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Capacitor serves the built `dist` from the app bundle (capacitor:// on iOS,
// https://localhost on Android), so a standard SPA build works — no Tauri host wiring.
export default defineConfig({
  plugins: [react()],
  server: { port: 1420 },
});
