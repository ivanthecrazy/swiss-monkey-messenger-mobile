import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { OrganizationTeamScreen } from "@regimenthq/messenger-core";
import { useCurrentOrganization } from "../services/currentOrganization.ts";
import OrganizationPicker from "./OrganizationPicker.tsx";

// The current organization's Team Members (ENABLE_APP_ORG_TEAM), under More: the
// members, inviting someone, editing them, their access level, a professional's
// schedule and report metrics, and removing them. The screen is messenger-core's, shared
// with the desktop and the web's team page. The organization is the back bar's pill.
const OrganizationTeam = () => {
  const { loaded, current, allOrganizations } = useCurrentOrganization();
  const [pickerOpen, setPickerOpen] = useState(false);

  let body = null;
  if (current?.permissions.manage_users) {
    body = <OrganizationTeamScreen slug={current.slug} />;
  } else if (loaded && !current && allOrganizations) {
    // An admin who hasn't picked an organization yet.
    body = (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography sx={{ mb: 2, color: "#45454B" }}>Choose an organization to see its team.</Typography>
        <Button variant="contained" onClick={() => setPickerOpen(true)}>Choose organization</Button>
      </Box>
    );
  } else if (loaded) {
    // Switched to an organization whose team they can't manage (the More entry goes
    // away with it, but they may still be on the screen).
    body = (
      <Typography sx={{ p: 4, textAlign: "center", color: "#45454B" }}>
        {current
          ? `You don't have access to ${current.name}'s team.`
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

export default OrganizationTeam;
