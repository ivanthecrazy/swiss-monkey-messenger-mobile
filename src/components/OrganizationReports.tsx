import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { OrganizationReportsScreen } from "@regimenthq/messenger-core";
import { getTokenStore } from "@regimenthq/shell-auth";
import { useCurrentOrganization } from "../services/currentOrganization.ts";
import OrganizationPicker from "./OrganizationPicker.tsx";

// The current organization's Productivity Reports (ENABLE_APP_ORG_REPORTS), under More:
// every professional's daily reports, then one to read. The screen is messenger-core's,
// shared with the desktop. Attachments open in the in-app browser. The organization is the
// back bar's pill. A pro's own reports are the "reports" tab (ProductivityReportsScreen).
const OrganizationReports = ({ onOpenUrl }: { onOpenUrl: (url: string) => void }) => {
  const user = getTokenStore().getUser() as { id?: number; admin?: boolean } | null;
  const { loaded, current, allOrganizations } = useCurrentOrganization();
  const [pickerOpen, setPickerOpen] = useState(false);

  let body = null;
  if (current && !current.permissions.access_reports) {
    // Reachable only by switching to an organization without the permission while here.
    body = (
      <Typography sx={{ p: 4, textAlign: "center", color: "#45454B" }}>
        You don&rsquo;t have access to this organization&rsquo;s productivity reports.
      </Typography>
    );
  } else if (current) {
    body = (
      <OrganizationReportsScreen
        key={current.slug}
        slug={current.slug}
        currency={current.currency}
        currentUserId={user?.id}
        isAdmin={Boolean(user?.admin)}
        onOpenFile={onOpenUrl}
      />
    );
  } else if (loaded && allOrganizations) {
    // An admin who hasn't picked an organization yet.
    body = (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography sx={{ mb: 2, color: "#45454B" }}>Choose an organization to see its productivity reports.</Typography>
        <Button variant="contained" onClick={() => setPickerOpen(true)}>Choose organization</Button>
      </Box>
    );
  } else if (loaded) {
    body = (
      <Typography sx={{ p: 4, textAlign: "center", color: "#45454B" }}>
        You&rsquo;re not a member of any organization.
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

export default OrganizationReports;
