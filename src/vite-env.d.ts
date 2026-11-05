/// <reference types="vite/client" />

// Injected at build time by vite.config.ts from SENTRY_DSN ("" when unset).
declare const __SENTRY_DSN__: string;

// Injected at build time by vite.config.ts from the build mode.
declare const __APP_ENV__: "production" | "staging";
declare const __PLATFORM_ORIGIN__: string;
