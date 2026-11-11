import { Box, Typography } from "@mui/material";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

export type MoreEntry = {
  key: string;
  label: string;
  Icon: typeof DescriptionOutlinedIcon;
  onClick: () => void;
};

// What the More tab opens, in order. Work Diary, Reports and My Profile only appear
// when the platform has them on for this user (see Messenger).
export const moreEntries = ({
  openFiles, openWorkDiary, openReports, openProfile, openSettings,
}: {
  openFiles: () => void;
  openWorkDiary?: () => void;
  openReports?: () => void;
  openProfile?: () => void;
  openSettings: () => void;
}): MoreEntry[] => [
  { key: "files", label: "Files", Icon: DescriptionOutlinedIcon, onClick: openFiles },
  ...(openWorkDiary ? [{ key: "time", label: "Work Diary", Icon: AccessTimeRoundedIcon, onClick: openWorkDiary }] : []),
  ...(openReports ? [{ key: "reports", label: "Productivity Reports", Icon: AssessmentOutlinedIcon, onClick: openReports }] : []),
  ...(openProfile ? [{ key: "profile", label: "My Profile", Icon: PersonOutlineRoundedIcon, onClick: openProfile }] : []),
  { key: "settings", label: "Settings", Icon: SettingsOutlinedIcon, onClick: openSettings },
];

// The More tab: everything that doesn't get its own bottom-bar button, as a list.
const MoreMenu = ({ entries }: { entries: MoreEntry[] }) => (
  <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 2, pt: 1 }}>
    {entries.map(({ key, label, Icon, onClick }) => (
      <Box
        key={key}
        role="button"
        onClick={onClick}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          py: "14px",
          borderBottom: "1px solid #EBEBF1",
          cursor: "pointer",
          color: "#171718",
        }}
      >
        <Icon sx={{ fontSize: 24, color: "#5E00FF" }} />
        <Typography sx={{ flex: 1, fontFamily: "Lato", fontSize: 16, fontWeight: 500 }}>{label}</Typography>
        <ChevronRightRoundedIcon sx={{ color: "#BCBCC5" }} />
      </Box>
    ))}
  </Box>
);

export default MoreMenu;
