import { Box, Typography } from "@mui/material";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";

// Every screen at the list level. Home, Chats and Alerts have their own bar buttons;
// the rest live under More (see MoreMenu), which stays highlighted while one is open.
export type MessengerTab =
  "home" | "chats" | "alerts" | "more" | "files" | "time" | "reports" | "payments" | "compliance" | "billing" | "team" | "contracts" | "timesheets";

export const MORE_TABS: MessengerTab[] = ["more", "files", "time", "reports", "payments", "compliance", "billing", "team", "contracts", "timesheets"];

type BarKey = "home" | "chats" | "alerts" | "more";

const ITEMS: { key: BarKey; label: string; Icon: typeof ChatBubbleOutlineRoundedIcon }[] = [
  // Pros only, while the platform has the app dashboard on (see Messenger's showHome).
  // First when shown, as in the desktop rail.
  { key: "home", label: "Home", Icon: HomeOutlinedIcon },
  { key: "chats", label: "Chats", Icon: ChatBubbleOutlineRoundedIcon },
  { key: "alerts", label: "Alerts", Icon: NotificationsNoneRoundedIcon },
  { key: "more", label: "More", Icon: MenuRoundedIcon },
];

// Mobile primary navigation — the phone analog of the desktop LeftRail, kept to four
// buttons so Chats and the Alerts badge stay one tap away. Sits at the bottom of the
// list level; the parent hides it while a conversation is open.
const BottomNav = ({
  tab, onChange, alertsUnread = 0, showHome = false,
}: {
  tab: MessengerTab;
  onChange: (t: MessengerTab) => void;
  alertsUnread?: number;
  showHome?: boolean;
}) => (
  <Box
    sx={{
      display: "flex",
      flexShrink: 0,
      borderTop: "1px solid #EBEBF1",
      backgroundColor: "#FFFFFF",
    }}
  >
    {ITEMS.filter(({ key }) => key !== "home" || showHome).map(({ key, label, Icon }) => {
      const active = key === "more" ? MORE_TABS.includes(tab) : tab === key;
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
