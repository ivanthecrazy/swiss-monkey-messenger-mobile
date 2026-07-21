import { useEffect, useState } from "react";
import { Routes, Route } from "react-router";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Toaster } from "react-hot-toast";
import { App as CapApp } from "@capacitor/app";
import theme from "./theme.tsx";
import { setAppVersion } from "./services/config.ts";
import { ProtectedRoute } from "@regimenthq/shell-auth";
import Login from "./pages/Login.tsx";
import Messenger from "./pages/Messenger.tsx";
import Settings from "./pages/Settings.tsx";

const App = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Native app version for the client-version gate. Throws on web (vite dev),
    // where we just fall back to the default in config.ts.
    CapApp.getInfo()
      .then((info) => setAppVersion(info.version))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={(
            <ProtectedRoute>
              <Messenger />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/settings"
          element={(
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          )}
        />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
