import { useEffect, useRef, useState } from "react";
import {
  Box, CircularProgress, Dialog, IconButton, InputAdornment, List, ListItemButton, ListItemIcon, ListItemText,
  TextField, Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  searchOrganizations, selectOrganization, useCurrentOrganization, type Organization,
} from "../services/currentOrganization.ts";

const SEARCH_DELAY_MS = 250;

const matches = (organization: Organization, query: string) =>
  organization.name.toLowerCase().includes(query.trim().toLowerCase());

// Pick the current organization from any number of them, full screen: a search box
// over a list that follows it. A member's organizations are all loaded already and are
// filtered in place; an admin's (every organization on the platform) are searched on
// the server. The desktop's picker is the same, as a dialog.
const OrganizationPicker = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const {
    organizations, hasMore, allOrganizations, current,
  } = useCurrentOrganization();
  const remote = allOrganizations || hasMore;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Organization[]>(organizations);
  const [resultsCut, setResultsCut] = useState(hasMore);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const searchSeq = useRef(0);

  // Start each opening fresh.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults(organizations);
    setResultsCut(hasMore);
    setFailed(false);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return undefined;
    if (!remote) {
      setResults(organizations.filter((o) => matches(o, query)));
      setResultsCut(false);
      return undefined;
    }
    // Server search, debounced; an older answer never replaces a newer one.
    const seq = ++searchSeq.current;
    setLoading(true);
    const timer = setTimeout(() => {
      searchOrganizations(query)
        .then(({ organizations: found, hasMore: more }) => {
          if (seq !== searchSeq.current) return;
          setResults(found);
          setResultsCut(more);
          setFailed(false);
        })
        .catch(() => { if (seq === searchSeq.current) setFailed(true); })
        .finally(() => { if (seq === searchSeq.current) setLoading(false); });
    }, query ? SEARCH_DELAY_MS : 0);
    return () => clearTimeout(timer);
  }, [open, query, remote, organizations]);

  const pick = (organization: Organization) => {
    selectOrganization(organization);
    onClose();
  };

  let footer: string | null = null;
  if (failed) footer = "Couldn't search organizations. Try again.";
  else if (!loading && results.length === 0) footer = query ? `No organizations match "${query}".` : "No organizations.";
  else if (resultsCut) footer = `Showing the first ${results.length}. Type to narrow it down.`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          pt: "var(--safe-area-inset-top, env(safe-area-inset-top))",
          pb: "var(--safe-area-inset-bottom, env(safe-area-inset-bottom))",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.5, borderBottom: "1px solid #EBEBF1", flexShrink: 0 }}>
        <IconButton onClick={onClose} aria-label="Back" edge="start"><ArrowBackIcon /></IconButton>
        <Typography sx={{ flex: 1, fontWeight: 700, fontSize: 16 }}>Switch organization</Typography>
      </Box>
      <Box sx={{ px: 2, pt: 1.5, flexShrink: 0 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={allOrganizations ? "Search all organizations" : "Search your organizations"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment>
            ),
            endAdornment: loading ? (
              <InputAdornment position="end"><CircularProgress size={16} /></InputAdornment>
            ) : null,
          }}
          inputProps={{ "aria-label": "Search organizations", enterKeyHint: "search" }}
        />
      </Box>
      <List role="listbox" sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 1 }}>
        {results.map((organization) => {
          const on = organization.slug === current?.slug;
          return (
            <ListItemButton
              key={organization.slug}
              role="option"
              aria-selected={on}
              selected={on}
              onClick={() => pick(organization)}
              sx={{ borderRadius: "8px", py: 1.25 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>{on && <CheckRoundedIcon fontSize="small" />}</ListItemIcon>
              <ListItemText primary={organization.name} primaryTypographyProps={{ noWrap: true, fontSize: 15 }} />
            </ListItemButton>
          );
        })}
        {footer && (
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography sx={{ fontSize: 13, color: "#88888C" }}>{footer}</Typography>
          </Box>
        )}
      </List>
    </Dialog>
  );
};

export default OrganizationPicker;
