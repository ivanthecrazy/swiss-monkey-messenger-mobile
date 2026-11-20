import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { OrganizationContractsScreen } from "@regimenthq/messenger-core";
import { useCurrentOrganization } from "../services/currentOrganization.ts";
import OrganizationPicker from "./OrganizationPicker.tsx";

// The current organization's Contracts (ENABLE_APP_ORG_CONTRACTS), under More: its
// professionals' engagements and, per contract, the rate (or Change rate), weekly limit,
// tech toolkit, BAA/NDA, a bonus, closing it and rehiring. The screen is messenger-core's,
// shared with the desktop and the web's contracts page; an office's playbook and a job open
// on the web, signed in. The organization is the back bar's pill.
const OrganizationContracts = ({ onOpenWebPath }: { onOpenWebPath: (path: string) => void }) => {
  const { loaded, current, allOrganizations } = useCurrentOrganization();
  const [pickerOpen, setPickerOpen] = useState(false);

  let body = null;
  if (current?.permissions.manage_contracts) {
    body = <OrganizationContractsScreen slug={current.slug} onOpenWebPath={onOpenWebPath} />;
  } else if (loaded && !current && allOrganizations) {
    // An admin who hasn't picked an organization yet.
    body = (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography sx={{ mb: 2, color: "#45454B" }}>Choose an organization to see its contracts.</Typography>
        <Button variant="contained" onClick={() => setPickerOpen(true)}>Choose organization</Button>
      </Box>
    );
  } else if (loaded) {
    // Switched to an organization whose contracts they can't manage (the More entry goes
    // away with it, but they may still be on the screen).
    body = (
      <Typography sx={{ p: 4, textAlign: "center", color: "#45454B" }}>
        {current
          ? `You don't have access to ${current.name}'s contracts.`
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

export default OrganizationContracts;
