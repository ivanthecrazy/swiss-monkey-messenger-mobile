import { Box, Typography } from "@mui/material";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";

export type MessengerTab = "chats" | "alerts" | "files" | "time";

const ITEMS: { key: MessengerTab; label: string; Icon: typeof ChatBubbleOutlineRoundedIcon }[] = [
  { key: "chats", label: "Chats", Icon: ChatBubbleOutlineRoundedIcon },
  { key: "alerts", label: "Alerts", Icon: NotificationsNoneRoundedIcon },
  { key: "files", label: "Files", Icon: DescriptionOutlinedIcon },
  { key: "time", label: "Work Diary", Icon: AccessTimeRoundedIcon },
];

// Mobile primary navigation — the phone analog of the desktop LeftRail. Sits at the
// bottom of the list level; the parent hides it while a conversation is open.
// The Work Diary tab is for pros only: shown when the user holds a position.
const BottomNav = ({
  tab, onChange, alertsUnread = 0, showWorkDiary = false,
}: {
  tab: MessengerTab;
  onChange: (t: MessengerTab) => void;
  alertsUnread?: number;
  showWorkDiary?: boolean;
}) => (
  <Box
    sx={{
      display: "flex",
      flexShrink: 0,
      borderTop: "1px solid #EBEBF1",
      backgroundColor: "#FFFFFF",
    }}
  >
    {ITEMS.filter(({ key }) => key !== "time" || showWorkDiary).map(({ key, label, Icon }) => {
      const active = tab === key;
      const showBadge = key === "alerts" && alertsUnread > 0;
      return (
        <Box
          key={key}
          onClick={() => onChange(key)}
          role="button"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px",
            py: "8px",
            cursor: "pointer",
            color: active ? "#5E00FF" : "#88888C",
          }}
        >
          <Box sx={{ position: "relative", display: "flex" }}>
            <Icon sx={{ fontSize: 24 }} />
            {showBadge && (
              <Box
                sx={{
                  position: "absolute", top: -4, right: -6, minWidth: 16, height: 16, px: "4px",
                  borderRadius: "999px", backgroundColor: "#5E00FF", color: "#fff",
                  fontFamily: "Lato", fontSize: 10, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {alertsUnread > 99 ? "99+" : alertsUnread}
              </Box>
            )}
          </Box>
          <Typography sx={{ fontFamily: "Lato", fontSize: 11, fontWeight: active ? 700 : 500 }}>
            {label}
          </Typography>
        </Box>
      );
    })}
  </Box>
);

export default BottomNav;
