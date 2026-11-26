import { useEffect, useState } from "react";
import { authGet } from "@regimenthq/shell-auth";

// Whether signing up in the app is switched on (ENABLE_APP_SIGNUP; a platform without the
// route 404s too, so the link stays hidden there).
export const useSignupEnabled = () => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    let cancelled = false;
    authGet("signup")
      .then(() => { if (!cancelled) setEnabled(true); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return enabled;
};
