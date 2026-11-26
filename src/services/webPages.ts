import { resolveWebLink } from "@regimenthq/messenger-core";
import { Browser } from "@capacitor/browser";
import { ensureMessengerClient } from "../messenger/bootstrap.ts";
import { PLATFORM_ORIGIN } from "./config.ts";

// Opens a page of the web app (a path) in the in-app browser, already signed in via the
// one-time handoff. Browser.open rather than window.open: the URL arrives after a request,
// and iOS drops a window.open that isn't a direct response to a tap. The server refuses the
// handoff to admins, and any failure falls back to the plain URL (the web's login page).
export const openWebPage = async (path: string) => {
  ensureMessengerClient(); // resolveWebLink's client
  let url = `${PLATFORM_ORIGIN}${path}`;
  try {
    url = await resolveWebLink(path);
  } catch {
    // keep the plain URL
  }
  Browser.open({ url }).catch(() => {});
};
