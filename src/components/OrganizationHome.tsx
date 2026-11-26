import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { OrganizationHomeScreen } from "@regimenthq/messenger-core";
import { useCurrentOrganization } from "../services/currentOrganization.ts";
import OrganizationPicker from "./OrganizationPicker.tsx";
import OrganizationPill from "./OrganizationPill.tsx";

// An office user's Home (ENABLE_APP_DASHBOARD): the current organization's dashboard, with
// the organization picker above it for someone in more than one.
const OrganizationHome = ({
  onOpenUrl, onOpenWebPath, onOpenReports,
}: {
  onOpenUrl: (url: string) => void;
  onOpenWebPath: (path: string) => void;
  onOpenReports?: () => void;
}) => {
  const { loaded, current, organizations, hasMore, allOrganizations } = useCurrentOrganization();
  const [pickerOpen, setPickerOpen] = useState(false);
  const canSwitch = allOrganizations || hasMore || organizations.length > 1;

  let body = null;
  if (current) {
    body = (
      <>
        {canSwitch && <Box sx={{ display: "flex", px: 2, pt: 2 }}><OrganizationPill /></Box>}
        <OrganizationHomeScreen
          organization={current}
          onOpenUrl={onOpenUrl}
          onOpenWebPath={onOpenWebPath}
          onOpenReports={onOpenReports}
        />
      </>
    );
  } else if (loaded && allOrganizations) {
    // An admin who hasn't picked an organization yet.
    body = (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography sx={{ mb: 2, color: "#45454B" }}>Choose an organization to see its dashboard.</Typography>
        <Button variant="contained" onClick={() => setPickerOpen(true)}>Choose organization</Button>
      </Box>
    );
  } else if (loaded) {
    body = <Typography sx={{ p: 4, textAlign: "center", color: "#45454B" }}>You&apos;re not a member of any organization.</Typography>;
  }

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
      {body}
      <OrganizationPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </Box>
  );
};

export default OrganizationHome;
