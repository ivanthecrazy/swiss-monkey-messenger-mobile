import { useNavigate } from "react-router";
import { Box } from "@mui/material";
import { SignupScreen } from "@regimenthq/messenger-core";
import { getAuthConfig, getTokenStore } from "@regimenthq/shell-auth";
import { Browser } from "@capacitor/browser";
import { ensureSignupApi } from "../messenger/bootstrap.ts";

// Signing up as an office: messenger-core's form and emailed code. Then the app, where the
// signup continues with the plan (Onboarding).
const Signup = () => {
  const navigate = useNavigate();
  // Before render returns: the screen fetches the form's options in a mount effect.
  ensureSignupApi();

  return (
    <Box
      sx={{
        height: "100vh",
        boxSizing: "border-box",
        overflowY: "auto",
        bgcolor: "#FFFFFF",
        pt: "var(--safe-area-inset-top, env(safe-area-inset-top))",
        pb: "var(--safe-area-inset-bottom, env(safe-area-inset-bottom))",
      }}
    >
      <SignupScreen
        deviceName={getAuthConfig().deviceName}
        onAuthenticated={({ token, user }) => {
          getTokenStore().setToken(token);
          getTokenStore().setUser(user);
          navigate("/", { replace: true });
        }}
        onOpenUrl={(url) => { Browser.open({ url }).catch(() => {}); }}
        onSignIn={() => navigate("/login")}
      />
    </Box>
  );
};

export default Signup;
