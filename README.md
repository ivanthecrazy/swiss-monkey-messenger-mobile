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

## Push notifications
Both platforms use **FCM** (Firebase relays to iOS through APNs), so the backend
has a single integration. The app code is wired already (`src/services/push.ts`:
permission → token → `POST /api/device_tokens`, token refresh, and tap-to-open-chat);
what remains is the Firebase project setup.

**One-time setup**
1. Create a Firebase project and add both apps to it:
   - **Android** package `io.swissmonkey.messenger` → download `google-services.json`
     → put it in `android/app/`.
   - **iOS** bundle id `io.swissmonkey.messenger` → download `GoogleService-Info.plist`
     → add it to the Xcode project (drag into `App/App`, "Copy items if needed").
2. **iOS only:** create an APNs auth key (`.p8`) in the Apple Developer portal and
   upload it in Firebase → Project settings → Cloud Messaging. Then in Xcode enable
   the **Push Notifications** capability and **Background Modes → Remote notifications**.
3. **Android only:** apply the Google Services plugin (per
   `@capacitor-firebase/messaging` docs) in `android/build.gradle` +
   `android/app/build.gradle`.
4. Backend: set `FIREBASE_PROJECT_ID` and `FIREBASE_SERVICE_ACCOUNT_JSON` (the
   service-account key JSON, verbatim) on the platform. Without them the send
   service is a no-op, so nothing breaks in environments that skip push.

Notifications fire for new messages from other people; muted chats are excluded
(the backend filters them upstream). Tapping one opens that conversation.

## Not yet
- Secure token storage (Keychain/Keystore) — currently the WebView's localStorage.
- Status-bar styling, deep links.
