import { ChangeEvent, useRef, useState } from "react";
import {
  Avatar, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Typography,
} from "@mui/material";
import toast from "react-hot-toast";
import { uploadAvatar } from "@regimenthq/shell-auth";

type Props = {
  open: boolean;
  onClose: () => void;
  currentPhotoUrl?: string;
  fallback: string;
  onUploaded: (photoUrl?: string) => void;
};

const AvatarEditDialog = ({ open, onClose, currentPhotoUrl, fallback, onUploaded }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setFile(null);
    setPreview(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    e.target.value = "";
    if (!chosen) return;
    setFile(chosen);
    setPreview(URL.createObjectURL(chosen));
  };

  const save = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const result = await uploadAvatar(file);
      if (result.success) {
        onUploaded(result.photo_url);
        toast.success("Avatar updated");
        close();
      } else {
        toast.error(result.errors?.join(", ") || "Couldn't update your avatar");
      }
    } catch {
      toast.error("Couldn't update your avatar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={close} maxWidth="xs" fullWidth>
      <DialogTitle>Edit avatar</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 1 }}>
          <Avatar
            src={preview || currentPhotoUrl || undefined}
            sx={{ width: 96, height: 96, bgcolor: "rgba(58,0,153,1)", fontSize: 32 }}
          >
            {fallback}
          </Avatar>
          <Button variant="outlined" onClick={() => fileRef.current?.click()}>Choose image</Button>
          {file && <Typography variant="body2" sx={{ color: "#88888C" }}>{file.name}</Typography>}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pick} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={save} disabled={!file || loading}>
          {loading ? <CircularProgress size={20} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AvatarEditDialog;
