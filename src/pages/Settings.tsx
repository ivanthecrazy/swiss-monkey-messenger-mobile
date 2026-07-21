import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Avatar, Box, Button, Divider, IconButton, Stack, Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { getTokenStore } from "@regimenthq/shell-auth";
import AvatarEditDialog from "../components/AvatarEditDialog.tsx";
import { PLATFORM_ORIGIN } from "../services/config.ts";

type CurrentUser = { id?: number; name?: string; email?: string; photo_url?: string };

const initials = (name?: string) =>
  (name || "?").trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("")
    .toUpperCase();

// Account screen: profile photo plus the in-app account deletion path that the
// App Store expects (guideline 5.1.1(v)).
const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getTokenStore().getUser() as CurrentUser | null);
  const [avatarOpen, setAvatarOpen] = useState(false);

  // Account deletion lives on the platform; open it in the system browser.
  const openAccountSettings = () => {
    const path = user?.id ? `/profiles/${user.id}/edit` : "/";
    window.open(`${PLATFORM_ORIGIN}${path}`, "_blank");
  };

  const onAvatarUploaded = (photoUrl?: string) => {
    const store = getTokenStore();
    const current = store.getUser();
    if (!current) return;
    const updated = { ...current, photo_url: photoUrl };
    store.setUser(updated);
    setUser(updated as CurrentUser);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxSizing: "border-box",
        bgcolor: "#FFFFFF",
        pt: "env(safe-area-inset-top)",
        pb: "env(safe-area-inset-bottom)",
      }}
    >
      <Box
        sx={{
          display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.5,
          borderBottom: "1px solid #EBEBF1", flexShrink: 0,
        }}
      >
        <IconButton onClick={() => navigate("/")} aria-label="Back" edge="start">
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Settings</Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        <Stack spacing={2} alignItems="center" sx={{ py: 2 }}>
          <Avatar
            src={user?.photo_url || undefined}
            sx={{ width: 96, height: 96, fontSize: 32, bgcolor: "rgba(58,0,153,1)" }}
          >
            {initials(user?.name)}
          </Avatar>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>{user?.name || "Signed in"}</Typography>
            <Typography sx={{ fontSize: 14, color: "#88888C" }}>{user?.email}</Typography>
          </Box>
          <Button variant="outlined" onClick={() => setAvatarOpen(true)}>
            Change photo
          </Button>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Delete account</Typography>
        <Typography sx={{ fontSize: 14, color: "#45454B", mb: 2 }}>
          Account deletion is handled on the Swiss Monkey website. This opens your
          account settings, where you can delete your account.
        </Typography>
        <Button
          color="error"
          variant="outlined"
          endIcon={<OpenInNewIcon />}
          onClick={openAccountSettings}
        >
          Delete account
        </Button>
      </Box>

      <AvatarEditDialog
        open={avatarOpen}
        onClose={() => setAvatarOpen(false)}
        currentPhotoUrl={user?.photo_url}
        fallback={initials(user?.name)}
        onUploaded={onAvatarUploaded}
      />
    </Box>
  );
};

export default Settings;
