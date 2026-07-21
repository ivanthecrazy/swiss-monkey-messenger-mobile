import { useState } from "react";
import {
  Badge, Box, Collapse, IconButton, InputAdornment, MenuItem, TextField, Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";

// Mirrors the web /admin/chats search box + filters.
export type ChatSearch = {
  q: string;
  chat_filter?: string;
  chat_type?: string;
  unread_only?: boolean;
  empty?: string;
};

const FILTER_OPTIONS = ["All", "Participating", "Muted", "Favorite", "Announcements"];
const TYPE_OPTIONS = ["All", "Engagement", "Support", "Job Assistant"];
const EMPTY_OPTIONS = ["Hide", "Show"];

type Props = {
  isAdmin: boolean;
  value: ChatSearch;
  onChange: (next: ChatSearch) => void;
};

const filterSx = { flex: 1, minWidth: 120 };

const ChatSearchBar = ({ isAdmin, value, onChange }: Props) => {
  const [showFilters, setShowFilters] = useState(false);
  const set = (patch: Partial<ChatSearch>) => onChange({ ...value, ...patch });

  // Any filter moved off its default — drives the dot on the toggle so active
  // filters are visible even while the row is collapsed.
  const filtersActive =
    (!!value.chat_filter && value.chat_filter !== "All")
    || !!value.chat_type
    || !!value.unread_only
    || (!!value.empty && value.empty !== "Hide");

  return (
    <Box sx={{ p: 2, borderBottom: "1px solid #EBEBF1" }}>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search conversations"
          value={value.q}
          onChange={(e) => set({ q: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "#88888C" }} />
              </InputAdornment>
            ),
          }}
        />
        {isAdmin && (
          <Tooltip title="Filters">
            <IconButton
              onClick={() => setShowFilters((s) => !s)}
              aria-label="Toggle filters"
              sx={{
                flexShrink: 0,
                border: "1px solid #EBEBF1",
                borderRadius: "8px",
                color: showFilters ? "#5E00FF" : "#45454B",
                backgroundColor: showFilters ? "#F2EEFF" : "transparent",
                "&:hover": { backgroundColor: "#F2EEFF" },
              }}
            >
              <Badge color="primary" variant="dot" invisible={!filtersActive}>
                <TuneIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {isAdmin && (
        <Collapse in={showFilters} unmountOnExit>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, pt: 1.5 }}>
            <TextField
              select size="small" label="Filter" sx={filterSx}
              value={value.chat_filter || "All"}
              onChange={(e) => set({ chat_filter: e.target.value })}
            >
              {FILTER_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </TextField>
            <TextField
              select size="small" label="Type" sx={filterSx}
              value={value.chat_type || "All"}
              onChange={(e) => set({ chat_type: e.target.value === "All" ? "" : e.target.value })}
            >
              {TYPE_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </TextField>
            <TextField
              select size="small" label="Unread" sx={filterSx}
              value={value.unread_only ? "Unread" : "All"}
              onChange={(e) => set({ unread_only: e.target.value === "Unread" })}
            >
              {["All", "Unread"].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </TextField>
            <TextField
              select size="small" label="Empty" sx={filterSx}
              value={value.empty || "Show"}
              onChange={(e) => set({ empty: e.target.value })}
            >
              {EMPTY_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </TextField>
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

export default ChatSearchBar;
