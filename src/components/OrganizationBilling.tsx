import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { OrganizationBillingScreen } from "@regimenthq/messenger-core";
import { useCurrentOrganization } from "../services/currentOrganization.ts";
import OrganizationPicker from "./OrganizationPicker.tsx";

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
