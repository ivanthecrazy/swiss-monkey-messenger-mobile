import { useNavigate } from "react-router";
import {
  Box, Button, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from "@mui/material";
import { useAuthFlow } from "@regimenthq/shell-auth";

// Thin MUI UI over the shared auth flow; all logic lives in @regimenthq/shell-auth.
const Login = () => {
  const navigate = useNavigate();
  const {
    step,
    email, setEmail,
    password, setPassword,
    method, setMethod,
    code, setCode,
    loading, error,
    submitCredentials, submitMethod, submitCode,
  } = useAuthFlow({ onAuthenticated: () => navigate("/") });

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <Stack spacing={2} sx={{ width: 320 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Swiss Monkey Messenger</Typography>
        {error && <Typography color="error" fontSize={14}>{error}</Typography>}

        {step === "credentials" && (
          <>
            <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitCredentials()}
            />
            <Button variant="contained" disabled={loading} onClick={submitCredentials}>
              Continue
            </Button>
          </>
        )}

        {step === "method" && (
          <>
            <Typography>Where should we send your verification code?</Typography>
            <ToggleButtonGroup
              exclusive
              value={method}
              onChange={(_, value) => value && setMethod(value)}
              fullWidth
            >
              <ToggleButton value="email">Email</ToggleButton>
              <ToggleButton value="sms">SMS</ToggleButton>
            </ToggleButtonGroup>
            <Button variant="contained" disabled={loading} onClick={submitMethod}>
              Send code
            </Button>
          </>
        )}

        {step === "code" && (
          <>
            <TextField
              label="Verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && submitCode()}
            />
            <Button variant="contained" disabled={loading} onClick={submitCode}>
              Sign in
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default Login;
