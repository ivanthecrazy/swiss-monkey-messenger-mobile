# Swiss Monkey Messenger — Mobile (Capacitor)

iOS + Android shell for the Swiss Monkey messenger. It's the same web app the
desktop (Tauri) shell runs — it reuses the published `@regimenthq/messenger-core`,
`@regimenthq/shell-auth`, and `@regimenthq/shared` packages — wrapped with Capacitor
for native iOS/Android.

## Prerequisites
- Node 18+, npm
- A GitHub token with `read:packages` for the `@regimenthq` scope (the `.npmrc`
  reads `${GITHUB_TOKEN}`): `export GITHUB_TOKEN=…`
- **iOS:** Xcode + CocoaPods
- **Android:** Android Studio + JDK 17

## First-time setup
```bash
export GITHUB_TOKEN=…
npm install

# Generate the native projects (creates ios/ and android/)
npx cap add ios
npx cap add android

# Build the web app and copy it into the native projects
npm run sync
```

## Run
```bash
npm run ios       # build + sync + open Xcode  → run on a simulator/device
npm run android   # build + sync + open Android Studio → run on an emulator/device
```
After changing web code, re-run `npm run sync` (or `npm run ios` / `npm run android`)
to copy the new build into the native shells.

## Backend endpoint
`src/services/config.ts` sets `PLATFORM_ORIGIN` (defaults to production). For local
testing:
- **iOS simulator** shares the Mac's network, so `http://localhost:3000` works.
- **Android emulator** reaches the host at `http://10.0.2.2:3000`.
- **Physical device** needs the Mac's LAN IP (e.g. `http://192.168.x.x:3000`) or a
  deployed backend. (Same as the desktop; and dev needs
  `SHRINE_FILE_HOST` set so avatar/file URLs are absolute — see the platform repo.)

The dev Rails server must allow the Capacitor origin for ActionCable
(`disable_request_forgery_protection` in development); production already lists
`capacitor://localhost` in `allowed_request_origins`.

## What's here (phase 1)
- Login (shared auth flow), chat list + conversation, real-time over ActionCable —
  all while the app is open.
- Single-pane mobile navigation (list ↔ conversation).
- App icons + splash screens for both platforms.

## Icons & splash
Source images live in `assets/` and are generated from `scripts/make-assets.py`
(brand purple + the chat-bubble mark, matching the desktop app):

| file | used for |
| --- | --- |
| `icon-only.png` | iOS app icon — full-bleed, no alpha (the OS applies the squircle mask) |
| `icon-foreground.png` / `icon-background.png` | Android adaptive icon layers |
| `splash.png` / `splash-dark.png` | launch screens |

Regenerate everything (source images + all platform sizes) with:
```bash
npm run assets
```
Then rebuild in Xcode / Android Studio. iOS caches icons aggressively — if the old
one lingers, delete the app from the simulator and clean the build folder.

## Not yet (phase 2)
- **Push notifications** (FCM / APNs) — the backend device-token registration
  (`POST/DELETE /api/device_tokens`) is done; still needs a Firebase project, an
  Apple push key, the mobile permission/registration flow, and the send pipeline.
- Secure token storage (Keychain/Keystore) — currently the WebView's localStorage.
- Status-bar styling, deep links.
