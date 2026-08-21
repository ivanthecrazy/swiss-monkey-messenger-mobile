import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.swissmonkey.chat",
  appName: "Swiss Monkey Messenger",
  webDir: "dist",
  ios: {
    // Let the web content extend under the status bar; pages handle safe-area insets.
    contentInset: "never",
  },
};

export default config;
