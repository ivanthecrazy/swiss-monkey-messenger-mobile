import { useState } from "react";
import { Box, Typography } from "@mui/material";
import UnfoldMoreRoundedIcon from "@mui/icons-material/UnfoldMoreRounded";
import { loadOrganizations, useCurrentOrganization } from "../services/currentOrganization.ts";
import OrganizationPicker from "./OrganizationPicker.tsx";

// More than one organization to choose from (always, for an admin).
const useCanSwitch = () => {
  const { organizations, hasMore, allOrganizations } = useCurrentOrganization();
  return allOrganizations || hasMore || organizations.length > 1;
};

// The current organization in an organization screen's back bar (Billing, Team) — the phone's counterpart
// of the desktop's top-bar pill. With more than one to choose from it opens the picker;
// with one it only names it.
const OrganizationPill = () => {
  const { current } = useCurrentOrganization();
  const canSwitch = useCanSwitch();
  const [pickerOpen, setPickerOpen] = useState(false);
  if (!current && !canSwitch) return null;

  const open = () => {
    if (!canSwitch) return;
    loadOrganizations(); // pick up memberships or permissions changed on the web
    setPickerOpen(true);
  };

  return (
    <>
      <Box
        role={canSwitch ? "button" : undefined}
        aria-label={canSwitch ? `Organization: ${current?.name ?? "none"}. Switch organization` : undefined}
        onClick={open}
        sx={{
          minWidth: 0,
          maxWidth: "60vw",
          height: 32,
          display: "flex",
          alignItems: "center",
          gap: "4px",
          pl: "12px",
          pr: canSwitch ? "6px" : "12px",
          mr: 1,
          borderRadius: "999px",
          border: "1px solid #EBEBF1",
          backgroundColor: "#FDFDFE",
          color: "#171718",
          cursor: canSwitch ? "pointer" : "default",
        }}
      >
        <Typography noWrap sx={{ fontSize: 14, fontWeight: 500 }}>{current?.name ?? "Choose organization"}</Typography>
        {canSwitch && <UnfoldMoreRoundedIcon sx={{ fontSize: 18, color: "#88888C", flexShrink: 0 }} />}
      </Box>
      <OrganizationPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </>
  );
};

export default OrganizationPill;
