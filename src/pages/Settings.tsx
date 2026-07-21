import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Divider, IconButton, Stack, Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import toast from "react-hot-toast";
import { authPost, getTokenStore } from "@regimenthq/shell-auth";
import AvatarEditDialog from "../components/AvatarEditDialog.tsx";

type CurrentUser = { name?: string; email?: string; photo_url?: string };

const initials = (name?: string) =>
  (name || "?").trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("")
    .toUpperCase();

// Account screen: profile photo plus the in-app account deletion path that the
// App Store expects (guideline 5.1.1(v)).
const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getTokenStore().getUser() as CurrentUser | null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const onAvatarUploaded = (photoUrl?: string) => {
    const store = getTokenStore();
    const current = store.getUser();
    if (!current) return;
    const updated = { ...current, photo_url: photoUrl };
    store.setUser(updated);
    setUser(updated as CurrentUser);
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      const result = await authPost<{ success: boolean; errors?: string[] }>(
        "account/deactivate", {},
      );
      if (result.success) {
        // The server already revoked the tokens; clear the local session too.
        getTokenStore().clear();
        navigate("/login", { replace: true });
      } else {
        toast.error(result.errors?.join(", ") || "Couldn't delete your account");
      }
    } catch {
      toast.error("Couldn't delete your account");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
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
          This deactivates your Swiss Monkey account, withdraws your job applications
          and closes your conversations. You&apos;ll be signed out on all devices.
        </Typography>
        <Button color="error" variant="outlined" onClick={() => setDeleteOpen(true)}>
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

      <Dialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)}>
        <DialogTitle>Delete your account?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This can&apos;t be undone from the app. Your conversations will be closed and
            any job applications withdrawn.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleting}>Cancel</Button>
          <Button color="error" variant="contained" onClick={deleteAccount} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete account"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
