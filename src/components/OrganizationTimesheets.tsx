import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { OrganizationTimesheetsScreen } from "@regimenthq/messenger-core";
import { useCurrentOrganization } from "../services/currentOrganization.ts";
import OrganizationPicker from "./OrganizationPicker.tsx";

// The current organization's Timesheets (ENABLE_APP_ORG_TIMESHEETS), under More: the week's
// hours per professional, their sessions, Give Bonus and (for those who may review them) the
// manual time requests. The screen is messenger-core's, shared with the desktop and the web's
// timesheets page. `link` is a Billing timer link's week and professional; attachments open
// in the in-app browser. The organization is the back bar's pill.
const OrganizationTimesheets = ({
  link, onOpenUrl,
}: {
  link: { startDate: string; userId: number | string } | null;
  onOpenUrl: (url: string) => void;
}) => {
  const { loaded, current, allOrganizations } = useCurrentOrganization();
  const [pickerOpen, setPickerOpen] = useState(false);

  let body = null;
  if (current) {
    body = (
      <OrganizationTimesheetsScreen
        slug={current.slug}
        startDate={link?.startDate ?? null}
        userId={link?.userId ?? null}
        onOpenUrl={onOpenUrl}
      />
    );
  } else if (loaded && allOrganizations) {
    // An admin who hasn't picked an organization yet.
    body = (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography sx={{ mb: 2, color: "#45454B" }}>Choose an organization to see its timesheets.</Typography>
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

export default OrganizationTimesheets;
