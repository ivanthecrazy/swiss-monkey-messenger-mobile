import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import UnfoldMoreRoundedIcon from "@mui/icons-material/UnfoldMoreRounded";
import { OrganizationBillingScreen } from "@regimenthq/messenger-core";
import { loadOrganizations, useCurrentOrganization } from "../services/currentOrganization.ts";
import OrganizationPicker from "./OrganizationPicker.tsx";

// More than one organization to choose from (always, for an admin).
const useCanSwitch = () => {
  const { organizations, hasMore, allOrganizations } = useCurrentOrganization();
  return allOrganizations || hasMore || organizations.length > 1;
};

// The current organization in the Billing screen's back bar — the phone's counterpart
// of the desktop's top-bar pill. With more than one to choose from it opens the picker;
// with one it only names it.
export const OrganizationPill = () => {
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

// The current organization's Billing & Payments (ENABLE_APP_ORG_BILLING), under More.
// The screen is messenger-core's, shared with the desktop and the web's billing page.
// The Stripe Billing Portal opens in the in-app browser; its last page says to come
// back, and the screen reloads when it closes (refreshSignal) or the app regains focus.
// Receipts and timesheets stay on the web and open there signed in.
const OrganizationBilling = ({
  onOpenUrl, onOpenWebPath, refreshSignal,
}: {
  onOpenUrl: (url: string) => void;
  onOpenWebPath: (path: string) => void;
  refreshSignal?: unknown;
}) => {
  const { loaded, current, allOrganizations } = useCurrentOrganization();
  const [pickerOpen, setPickerOpen] = useState(false);

  let body = null;
  if (current?.permissions.view_billing) {
    body = (
      <OrganizationBillingScreen
        slug={current.slug}
        onOpenUrl={onOpenUrl}
        onOpenWebPath={onOpenWebPath}
        refreshSignal={refreshSignal}
      />
    );
  } else if (loaded && !current && allOrganizations) {
    // An admin who hasn't picked an organization yet.
    body = (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography sx={{ mb: 2, color: "#45454B" }}>Choose an organization to see its billing.</Typography>
        <Button variant="contained" onClick={() => setPickerOpen(true)}>Choose organization</Button>
      </Box>
    );
  } else if (loaded) {
    // Switched to an organization whose billing they can't see (the More entry goes
    // away with it, but they may still be on the screen).
    body = (
      <Typography sx={{ p: 4, textAlign: "center", color: "#45454B" }}>
        {current
          ? `You don't have access to ${current.name}'s billing.`
          : "You're not a member of any organization."}
      </Typography>
    );
  }

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
      {body}
      <OrganizationPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </Box>
  );
};

export default OrganizationBilling;
