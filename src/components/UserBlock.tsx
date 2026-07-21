import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, IconButton, Menu, MenuItem, Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { getTokenStore, logout } from "@regimenthq/shell-auth";
import AvatarEditDialog from "./AvatarEditDialog.tsx";

// The stored user carries more than shell-auth's User type declares (e.g. photo_url
// from the login serializer), so read those extra fields loosely.
type CurrentUser = { name?: string; email?: string; photo_url?: string };

const initials = (name?: string) =>
  (name || "?")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const UserBlock = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getTokenStore().getUser() as CurrentUser | null);
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  const signOut = async () => {
    setConfirmOpen(false);
    await logout(); // revokes the token server-side + clears the local session
    navigate("/login", { replace: true });
  };

  // Persist the new avatar to the token store and refresh the displayed one.
  const onAvatarUploaded = (photoUrl?: string) => {
    const store = getTokenStore();
    const current = store.getUser();
    if (!current) return;
    const updated = { ...current, photo_url: photoUrl };
    store.setUser(updated);
    setUser(updated as CurrentUser);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 2, borderBottom: "1px solid #EBEBF1" }}>
      <Avatar src={user?.photo_url || undefined} sx={{ bgcolor: "rgba(58,0,153,1)", width: 40, height: 40 }}>
        {initials(user?.name)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {user?.name || "Signed in"}
        </Typography>
        <Typography sx={{ fontSize: 12, color: "#88888C", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {user?.email}
        </Typography>
      </Box>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} aria-label="account menu">
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { setAnchor(null); setAvatarOpen(true); }}>Edit avatar</MenuItem>
        <MenuItem onClick={() => { setAnchor(null); setConfirmOpen(true); }}>Sign out</MenuItem>
      </Menu>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Sign out?</DialogTitle>
        <DialogContent>
          <DialogContentText>You'll need to sign in again to use the messenger.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={signOut}>Sign out</Button>
        </DialogActions>
      </Dialog>

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

export default UserBlock;
