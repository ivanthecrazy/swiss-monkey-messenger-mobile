import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { OnboardingGate } from "@regimenthq/messenger-core";
import { getTokenStore, logout } from "@regimenthq/shell-auth";
import { Browser } from "@capacitor/browser";
import { connectSignupRealtime, ensureMessengerClient } from "../messenger/bootstrap.ts";
import { loadOrganizations } from "../services/currentOrganization.ts";
import { unregisterPush } from "../services/push.ts";
import { openWebPage } from "../services/webPages.ts";

// Around the signed-in app: an office user whose practice isn't set up finishes signing up
// first (plan, Stripe Checkout in the in-app browser, authorization), and a new professional
// their profile, agreements and certificate; then they land on Home.
const Onboarding = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  // Closing the in-app browser doesn't focus the web view, so the gate is told.
  const [browserClosedAt, setBrowserClosedAt] = useState(0);
  // Before render returns: the gate fetches in a mount effect.
  ensureMessengerClient();

  useEffect(() => {
    const handle = Browser.addListener("browserFinished", () => setBrowserClosedAt(Date.now()));
    return () => { handle.then((h) => h.remove()).catch(() => {}); };
  }, []);

  return (
    <OnboardingGate
      user={getTokenStore().getUser()}
      onOpenUrl={(url) => {
        // The in-app browser only opens web pages.
        if (url.startsWith("mailto:")) window.open(url, "_system");
        else Browser.open({ url }).catch(() => {});
      }}
      onOpenWebPath={openWebPage}
      onLogout={async () => {
        await unregisterPush(); // while still authenticated, as at sign out
        await logout();
        navigate("/login");
      }}
      // Not supported on Android, where its last page says to come back.
      onPaid={() => { Browser.close().catch(() => {}); }}
      onCompleted={() => {
        loadOrganizations(); // its subscription status and permissions, now that it's set up
        navigate("/", { replace: true, state: { openHome: true } });
      }}
      refreshSignal={browserClosedAt}
      connectRealtime={connectSignupRealtime}
      sx={{
        height: "100vh",
        boxSizing: "border-box",
        pt: "var(--safe-area-inset-top, env(safe-area-inset-top))",
        pb: "var(--safe-area-inset-bottom, env(safe-area-inset-bottom))",
      }}
    >
      {children}
    </OnboardingGate>
  );
};

export default Onboarding;
