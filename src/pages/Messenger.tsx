import { useEffect, useRef, useState, ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  Box, Button, CircularProgress, IconButton, InputBase, Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import CloseRoundedIcon from "@mui/icons-material/Close";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import {
  AssistantTasksPanel, ChatProvider, ChatsList, Conversation, TeamDialog, fetchChats,
  triggerUnreadChatsLoadedEvent, useAssistantTasks,
  GroupedChatsList, NotificationsList, SearchResultsPanel, FilesList, ContractorDashboardScreen,
  OwnProfileScreen, WorkDiaryScreen, fetchDiaryPositions, resolveWebLink, ProductivityReportsScreen, PaymentsScreen,
  ComplianceCenterScreen,
} from "@regimenthq/messenger-core";
import { startMessenger, stopMessenger, ensureMessengerClient } from "../messenger/bootstrap.ts";
import { getTokenStore, authGet } from "@regimenthq/shell-auth";
import { Browser } from "@capacitor/browser";
import UserBlock from "../components/UserBlock.tsx";
import PullToRefresh from "../components/PullToRefresh.tsx";
import BottomNav, { MessengerTab } from "../components/BottomNav.tsx";
import MoreMenu, { moreEntries } from "../components/MoreMenu.tsx";
import { registerPush } from "../services/push.ts";
import { PLATFORM_ORIGIN } from "../services/config.ts";
import { useCurrentOrganization } from "../services/currentOrganization.ts";
import OrganizationBilling from "../components/OrganizationBilling.tsx";
import OrganizationTeam from "../components/OrganizationTeam.tsx";
import OrganizationContracts from "../components/OrganizationContracts.tsx";
import OrganizationTimesheets from "../components/OrganizationTimesheets.tsx";
import OrganizationReports from "../components/OrganizationReports.tsx";
import OrganizationPill from "../components/OrganizationPill.tsx";

// Single-pane mobile messenger. A bottom nav switches between Chats (grouped list +
// search), Alerts, More and — for pros — Home; More lists the rest (Files, and for
// pros Work Diary, Productivity Reports and My Profile, then Settings), each opening
// with a back arrow to the list. Tapping a chat pushes the conversation over
// everything, and the back arrow returns. The grouped list, alerts, search,
// and files are shared components from messenger-core — the same code the desktop
// shell runs — so the two stay in sync.
// The screens under More get a back arrow (to the More list) and this title in
// place of the user block.
// Productivity Reports, Payments and the Compliance Center title themselves, so their
// bars carry the arrow alone.
const MORE_TITLES: Partial<Record<MessengerTab, string>> = {
  files: "Files",
  time: "Work Diary",
  reports: "",
  payments: "",
  compliance: "",
  billing: "",
  team: "",
  contracts: "",
  timesheets: "",
  orgReports: "",
};

const Messenger = () => {
  const navigate = useNavigate();
  // Configure the API client now, during render — the self-loading messenger-core
  // components fetch in their mount effects, which fire before this component's
  // mount effect. Doing it only in startMessenger (an effect) would send that first
  // /chats/grouped request to the app origin instead of /api. Idempotent.
  ensureMessengerClient();

  const currentUser = getTokenStore().getUser();
  const currentUserId = (currentUser as { id?: number } | null)?.id;
  const isAdmin = Boolean((currentUser as { admin?: boolean } | null)?.admin);

  const [tab, setTab] = useState<MessengerTab>("chats");
  // The Home tab is for pros while the platform has ENABLE_APP_DASHBOARD on (a
  // platform without the key reads as off). The server 403s anyone else anyway.
  const [showHome, setShowHome] = useState(false);
  // The pro's own profile (same gate as Home), shown over the tabs rather than as a
  // route: the user cable lives on this page, and the resume upload needs it for the
  // CV extraction result.
  const [profileOpen, setProfileOpen] = useState(false);
  // Pros with a position get the Work Diary tab, once the platform has it switched
  // on (ENABLE_WORK_DIARY); everyone else never sees it.
  const [showWorkDiary, setShowWorkDiary] = useState(false);
  // A pro's productivity reports (ENABLE_APP_PRODUCTIVITY_REPORTS), under More.
  const [showReports, setShowReports] = useState(false);
  // A pro's Payments page (ENABLE_APP_PAYMENTS), under More.
  const [showPayments, setShowPayments] = useState(false);
  // A pro's Compliance Center (ENABLE_APP_COMPLIANCE_CENTER), under More. Also opened
  // by Home's and the profile's compliance links; Back then returns there.
  const [showCompliance, setShowCompliance] = useState(false);
  const [complianceFrom, setComplianceFrom] = useState<{ tab: MessengerTab; profile: boolean } | null>(null);
  // An office user's organization Billing & Payments (ENABLE_APP_ORG_BILLING), under
  // More: for the current organization (picked in that screen's bar) when it grants
  // them view_billing, and for an admin always (the screen asks them to pick one).
  const [orgBillingEnabled, setOrgBillingEnabled] = useState(false);
  const { current: currentOrganization, allOrganizations } = useCurrentOrganization();
  const showBilling = orgBillingEnabled && Boolean(currentOrganization?.permissions.view_billing || allOrganizations);
  // Its Team Members (ENABLE_APP_ORG_TEAM), the same way, for those who may manage the team.
  const [orgTeamEnabled, setOrgTeamEnabled] = useState(false);
  const showTeam = orgTeamEnabled && Boolean(currentOrganization?.permissions.manage_users || allOrganizations);
  const [orgContractsEnabled, setOrgContractsEnabled] = useState(false);
  // Timesheets have no permission of their own: any office member of the organization.
  const [orgTimesheetsEnabled, setOrgTimesheetsEnabled] = useState(false);
  const showTimesheets = orgTimesheetsEnabled && Boolean(currentOrganization || allOrganizations);
  // Its Productivity Reports (ENABLE_APP_ORG_REPORTS), for those with access to reports.
  const [orgReportsEnabled, setOrgReportsEnabled] = useState(false);
  const showOrgReports = orgReportsEnabled && Boolean(currentOrganization?.permissions.access_reports || allOrganizations);
  // Billing's timer links open the Timesheets on that week and professional.
  const [timesheetsLink, setTimesheetsLink] = useState<{ startDate: string; userId: number | string } | null>(null);
  const showContracts = orgContractsEnabled
    && Boolean(currentOrganization?.permissions.manage_contracts || allOrganizations);
  // Bumped when the in-app browser closes (the pro coming back from Stripe), which
  // doesn't focus the web view, so the Payments screen reloads the account's state.
  const [browserClosedAt, setBrowserClosedAt] = useState(0);
  useEffect(() => {
    const handle = Browser.addListener("browserFinished", () => setBrowserClosedAt(Date.now()));
    return () => { handle.then((h) => h.remove()).catch(() => {}); };
  }, []);
  // Set while Reports was opened from a Home link (an office's report, or its View
  // All): which report to show, and Back returns to Home instead of More.
  const [reportsFromHome, setReportsFromHome] = useState<{
    report: { organizationSlug: string; id: number } | null;
  } | null>(null);
  // One /api/config read decides all of them.
  useEffect(() => {
    const isContractor = (currentUser as { user_type?: string } | null)?.user_type === "contractor";
    authGet<{
      enable_app_dashboard?: boolean; enable_work_diary?: boolean; enable_productivity_reports?: boolean;
      enable_payments?: boolean; enable_compliance_center?: boolean; enable_org_billing?: boolean;
      enable_org_team?: boolean; enable_org_contracts?: boolean; enable_org_timesheets?: boolean;
      enable_org_reports?: boolean;
    }>("config")
      .then((cfg) => {
        setShowHome(isContractor && cfg?.enable_app_dashboard === true);
        setShowReports(isContractor && cfg?.enable_productivity_reports === true);
        setShowPayments(isContractor && cfg?.enable_payments === true);
        setShowCompliance(isContractor && cfg?.enable_compliance_center === true);
        // The organization side is for office users (a legacy office account has no
        // user_type); contractors' pages are the pro ones above.
        setOrgBillingEnabled(!isContractor && cfg?.enable_org_billing === true);
        setOrgTeamEnabled(!isContractor && cfg?.enable_org_team === true);
        setOrgContractsEnabled(!isContractor && cfg?.enable_org_contracts === true);
        setOrgTimesheetsEnabled(!isContractor && cfg?.enable_org_timesheets === true);
        setOrgReportsEnabled(!isContractor && cfg?.enable_org_reports === true);
        if (cfg?.enable_work_diary !== true) return;
        fetchDiaryPositions()
          .then((positions) => setShowWorkDiary(positions.length > 0))
          .catch(() => {});
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [alertsUnread, setAlertsUnread] = useState(0);
  // The Alerts badge: seeded here, then live from the cable (the list keeps it in sync
  // while it's open).
  useEffect(() => {
    authGet("notifications")
      .then((d) => setAlertsUnread((d as { unread_count?: number } | null)?.unread_count || 0))
      .catch(() => {});
    const onChange = (e: Event) => setAlertsUnread((e as CustomEvent).detail?.count || 0);
    window.addEventListener("notificationsChanged", onChange);
    return () => window.removeEventListener("notificationsChanged", onChange);
  }, []);
  // Bumped to force the grouped list to refetch (pull-to-refresh).
  const [groupRefresh, setGroupRefresh] = useState(0);

  // Working set behind the open conversation. The grouped list and search fetch
  // their own data; this list just resolves the selected chat (and is warmed with
  // the user's recent chats so opening one is instant).
  const [chats, setChats] = useState<any[]>([]);
  const chatsRef = useRef(chats);
  chatsRef.current = chats;
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [openingChat, setOpeningChat] = useState(false);

  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<any>(null);

  const assistantTasks = useAssistantTasks();
  const [tasksOpen, setTasksOpen] = useState(false);
  const [focusMessageId, setFocusMessageId] = useState<number | null>(null);

  // Chats already marked read on the server this session (see the desktop shell for
  // the full rationale) — keeps a stale unread:true from a list fetch in flight from
  // putting the dot back on a chat just cleared.
  const readChatIdsRef = useRef<Set<number>>(new Set());
  const applyKnownReads = (chat: any) => (
    readChatIdsRef.current.has(chat.id) ? { ...chat, unread: false } : chat
  );

  const markRead = (chatId: number) => setChats(
    (prev) => prev.map((c) => (c.id === chatId ? { ...c, unread: false } : c)),
  );

  // Open a chat by id. Fast path when it's already in the working set; otherwise
  // fetch it on the fly. `focus` is the message to land on.
  const openChat = async (chatId: number, focus: number | null = null) => {
    setTasksOpen(false);
    setFocusMessageId(focus);
    setSelectedChatId(chatId);

    if (chatsRef.current.some((c) => c.id === chatId)) {
      markRead(chatId);
      return;
    }

    setOpeningChat(true);
    try {
      const data = await authGet(`chats/${chatId}`) as { chat?: any } | null;
      const chat = data?.chat;
      if (chat) {
        setChats((prev) => (prev.some((c) => c.id === chat.id)
          ? prev.map((c) => (c.id === chat.id ? { ...chat, unread: false } : c))
          : [{ ...chat, unread: false }, ...prev]));
      } else {
        setSelectedChatId(null);
      }
    } catch {
      setSelectedChatId(null);
    } finally {
      setOpeningChat(false);
    }
  };

  const onTeamSaved = (chat: any) => {
    setChats((prev) => {
      const exists = prev.some((c) => c.id === chat.id);
      return exists ? prev.map((c) => (c.id === chat.id ? { ...c, ...chat } : c)) : [chat, ...prev];
    });
    setSelectedChatId(chat.id);
  };

  // Warm the working set + drive the unread badge. Merges (doesn't replace) so a
  // chat openChat added that isn't in this recent page is never dropped.
  const loadWorkingSet = async () => {
    const data = await fetchChats(1, { q: "" });
    if (!data?.chats) return;
    triggerUnreadChatsLoadedEvent(data.total_unread);
    const fetched = data.chats.map(applyKnownReads);
    setChats((prev) => {
      const ids = new Set(fetched.map((c: any) => c.id));
      return [...fetched, ...prev.filter((c) => !ids.has(c.id))];
    });
  };

  const refresh = async () => {
    setGroupRefresh((n) => n + 1);
    await loadWorkingSet();
  };

  useEffect(() => {
    startMessenger();
    registerPush((target) => {
      if ("chatId" in target) {
        openChat(target.chatId);
        return;
      }
      // Whatever is open over the tabs gives way to Alerts.
      setProfileOpen(false);
      setTasksOpen(false);
      setOpeningChat(false);
      setSelectedChatId(null);
      setTab("alerts");
    });
    loadWorkingSet();
    return () => stopMessenger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onNewChat = (e: any) => {
      const { chat } = e.detail;
      setChats((prev) => {
        const existing = prev.find((c) => c.id === chat.id);
        return existing ? prev.map((c) => (c.id === chat.id ? chat : c)) : [chat, ...prev];
      });
    };
    const onMessage = (e: any) => {
      const { message } = e.detail;
      const seen = message.chat_id === selectedChatId && document.visibilityState !== "hidden";
      if (!seen) readChatIdsRef.current.delete(message.chat_id);
      setChats((prev) => {
        const existing = prev.find((c) => c.id === message.chat_id);
        if (!existing) return message.chat ? [message.chat, ...prev] : prev;
        const now = new Date().toISOString();
        return prev.map((c) => (
          c.id === message.chat_id ? { ...c, last_message_time: now, unread: !seen } : c
        ));
      });
    };
    const onChatRead = (e: any) => {
      const { chatId } = e.detail;
      readChatIdsRef.current.add(chatId);
      setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, unread: false } : c)));
    };
    const onRemoved = (e: any) => {
      const { id } = e.detail;
      readChatIdsRef.current.delete(id);
      setChats((prev) => prev.filter((c) => c.id !== id));
      setSelectedChatId((cur) => (cur === id ? null : cur));
    };
    window.addEventListener("newChatStarted", onNewChat);
    window.addEventListener("chatMessageReceived", onMessage);
    window.addEventListener("chatRead", onChatRead);
    window.addEventListener("chatRemoved", onRemoved);
    return () => {
      window.removeEventListener("newChatStarted", onNewChat);
      window.removeEventListener("chatMessageReceived", onMessage);
      window.removeEventListener("chatRead", onChatRead);
      window.removeEventListener("chatRemoved", onRemoved);
    };
  }, [selectedChatId]);

  const selectedChat = chats.find((c) => c.id === selectedChatId);
  const showTasksPanel = tasksOpen && assistantTasks.enabled;

  const titleFor = (chat: any): string => {
    if (!chat) return "";
    if (chat.display_name) return chat.display_name;
    if (chat.support) return "Swiss Monkey Support";
    const other = chat.users?.find((u: any) => u.id !== currentUserId);
    return other?.name || chat.job?.title || "Chat";
  };

  // Web pages (Work Diary's ID verification, alert links) open in the system browser
  // already signed in, via the one-time handoff. Browser.open rather than
  // window.open: the URL arrives after a request, and iOS drops a window.open that
  // isn't a direct response to a tap. The server refuses the handoff to admins, and
  // any failure falls back to the plain URL (the web's login page).
  const openPlatformUrl = async (path: string) => {
    let url = `${PLATFORM_ORIGIN}${path}`;
    try {
      url = await resolveWebLink(path);
    } catch {
      // keep the plain URL
    }
    Browser.open({ url });
  };
  const openFile = (url: string) => { window.open(url, "_blank"); };
  const openCompliance = (from: { tab: MessengerTab; profile: boolean } | null) => {
    setComplianceFrom(from);
    setProfileOpen(false);
    setTab("compliance");
  };

  const backHeader = (onBack: () => void, title?: string, right?: ReactNode) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.5, borderBottom: "1px solid #EBEBF1", flexShrink: 0 }}>
      <IconButton onClick={onBack} aria-label="Back" edge="start"><ArrowBackIcon /></IconButton>
      {/* flex:1 so it also acts as a spacer, keeping `right` aligned to the end when
          there's no title. */}
      <Typography sx={{ flex: 1, fontWeight: 700, fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {title}
      </Typography>
      {right}
    </Box>
  );

  return (
    <ChatProvider currentUser={currentUser}>
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxSizing: "border-box",
          bgcolor: "#FFFFFF",
          pt: "var(--safe-area-inset-top, env(safe-area-inset-top))",
          pb: "var(--safe-area-inset-bottom, env(safe-area-inset-bottom))",
        }}
      >
        {profileOpen && showHome ? (
          <>
            {backHeader(() => setProfileOpen(false), "My Profile")}
            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
              <OwnProfileScreen
                openExternal={(url) => { Browser.open({ url }); }}
                onOpenComplianceCenter={showCompliance ? () => openCompliance({ tab, profile: true }) : undefined}
              />
            </Box>
          </>
        ) : showTasksPanel ? (
          <>
            {backHeader(() => setTasksOpen(false))}
            <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              {assistantTasks.data && (
                <AssistantTasksPanel
                  data={assistantTasks.data}
                  onOpenSource={(chatId, messageId) => openChat(chatId, messageId)}
                  onTasksChanged={assistantTasks.onTasksChanged}
                />
              )}
            </Box>
          </>
        ) : selectedChat ? (
          <>
            {backHeader(
              () => setSelectedChatId(null),
              titleFor(selectedChat),
              isAdmin && selectedChat.kind === "team" ? (
                <Button size="small" onClick={() => { setTeamToEdit(selectedChat); setTeamDialogOpen(true); }}>
                  Manage
                </Button>
              ) : undefined,
            )}
            <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              {/* Title lives in the back bar above; hide the Conversation's own. */}
              <Conversation chat={selectedChat} focusMessageId={focusMessageId} hideTitle />
            </Box>
          </>
        ) : openingChat ? (
          <>
            {backHeader(() => { setSelectedChatId(null); setOpeningChat(false); })}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1.5, color: "#88888C" }}>
              <CircularProgress size={28} />
              <Typography sx={{ fontSize: 14 }}>Opening chat…</Typography>
            </Box>
          </>
        ) : (
          <>
            {MORE_TITLES[tab] !== undefined ? (
              backHeader(() => {
                if (tab === "reports" && reportsFromHome) {
                  setReportsFromHome(null);
                  setTab("home");
                } else if (tab === "compliance" && complianceFrom) {
                  setComplianceFrom(null);
                  setTab(complianceFrom.tab);
                  setProfileOpen(complianceFrom.profile);
                } else {
                  setTab("more");
                }
              }, MORE_TITLES[tab], tab === "billing" || tab === "team" || tab === "contracts" || tab === "timesheets"
                || tab === "orgReports"
                ? <OrganizationPill /> : undefined)
            ) : (
              <UserBlock onOpenProfile={showHome ? () => setProfileOpen(true) : undefined} />
            )}
            <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              {tab === "chats" && (
                <>
                  {/* Search + (admin) new team */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, pt: 1, pb: 0.5 }}>
                    <Box sx={{ flex: 1, height: 40, display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#FDFDFE", border: "1px solid #EBEBF1", borderRadius: "8px", px: "12px" }}>
                      <SearchIcon sx={{ fontSize: 18, color: "#88888C" }} />
                      <InputBase
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search chats & messages…"
                        sx={{ flex: 1, fontFamily: "Lato", fontSize: 15, "& input": { p: 0 } }}
                      />
                      {searchQuery && (
                        <IconButton onClick={() => setSearchQuery("")} size="small" aria-label="Clear search" sx={{ p: "2px" }}>
                          <CloseRoundedIcon sx={{ fontSize: 16, color: "#88888C" }} />
                        </IconButton>
                      )}
                    </Box>
                    {isAdmin && (
                      <IconButton
                        onClick={() => { setTeamToEdit(null); setTeamDialogOpen(true); }}
                        aria-label="New team"
                        sx={{ width: 40, height: 40, flexShrink: 0, border: "1px solid #EBEBF1", borderRadius: "8px", color: "#45454B" }}
                      >
                        <GroupAddIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  {searchQuery.trim() ? (
                    <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                      <SearchResultsPanel
                        query={searchQuery}
                        currentUser={currentUser}
                        onOpenChat={(chatId, messageId) => openChat(chatId, messageId ?? null)}
                      />
                    </Box>
                  ) : (
                    <PullToRefresh onRefresh={refresh} sx={{ flex: 1, p: 2, "& .MuiList-root": { p: 0 } }}>
                      {assistantTasks.topItem && (
                        <ChatsList
                          chats={[]}
                          selectedChatId={selectedChatId}
                          onChatSelected={(chat) => openChat(chat.id)}
                          topItem={assistantTasks.topItem}
                          topItemSelected={tasksOpen}
                          onTopItemSelected={() => { setTasksOpen(true); setSelectedChatId(null); }}
                        />
                      )}
                      <GroupedChatsList
                        currentUser={currentUser}
                        selectedChatId={selectedChatId}
                        onChatSelected={(chat) => openChat(chat.id)}
                        refreshSignal={groupRefresh}
                      />
                    </PullToRefresh>
                  )}
                </>
              )}

              {tab === "home" && showHome && (
                <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                  {/* Browser.open, not window.open: the URL arrives after a request
                      (the sign-in handoff), and iOS drops a window.open that isn't
                      a direct response to a tap. */}
                  <ContractorDashboardScreen
                    openExternal={(url) => { Browser.open({ url }); }}
                    onOpenProfile={() => setProfileOpen(true)}
                    onOpenReports={showReports ? (report) => {
                      setReportsFromHome({ report });
                      setTab("reports");
                    } : undefined}
                    onOpenComplianceCenter={showCompliance ? () => openCompliance({ tab: "home", profile: false }) : undefined}
                  />
                </Box>
              )}

              {tab === "alerts" && (
                <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", p: 2 }}>
                  <NotificationsList
                    currentUserId={currentUserId}
                    onOpenChat={(chatId, messageId) => openChat(chatId, messageId ?? null)}
                    onOpenUrl={openPlatformUrl}
                    onUnreadChange={setAlertsUnread}
                    onOpenAttachment={(url) => { Browser.open({ url }); }}
                  />
                </Box>
              )}

              {tab === "more" && (
                <MoreMenu
                  entries={moreEntries({
                    openFiles: () => setTab("files"),
                    openWorkDiary: showWorkDiary ? () => setTab("time") : undefined,
                    openReports: showReports ? () => { setReportsFromHome(null); setTab("reports"); } : undefined,
                    openPayments: showPayments ? () => setTab("payments") : undefined,
                    openCompliance: showCompliance ? () => openCompliance(null) : undefined,
                    openContracts: showContracts ? () => setTab("contracts") : undefined,
                    openTimesheets: showTimesheets ? () => { setTimesheetsLink(null); setTab("timesheets"); } : undefined,
                    openOrgReports: showOrgReports ? () => setTab("orgReports") : undefined,
                    openTeam: showTeam ? () => setTab("team") : undefined,
                    openBilling: showBilling ? () => setTab("billing") : undefined,
                    openProfile: showHome ? () => setProfileOpen(true) : undefined,
                    openSettings: () => navigate("/settings"),
                  })}
                />
              )}

              {tab === "reports" && showReports && (
                <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                  <ProductivityReportsScreen
                    currentUserId={currentUserId}
                    currency={(currentUser as { currency?: string } | null)?.currency}
                    onOpenFile={(url) => { Browser.open({ url }); }}
                    openReport={reportsFromHome?.report ?? undefined}
                  />
                </Box>
              )}

              {tab === "payments" && showPayments && (
                <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                  {/* Stripe opens in the in-app browser; its last page says to come
                      back, and the screen reloads when the app regains focus. */}
                  <PaymentsScreen
                    displayCurrency={(currentUser as { currency?: string } | null)?.currency}
                    onOpenUrl={(url) => { Browser.open({ url }); }}
                    refreshSignal={browserClosedAt}
                  />
                </Box>
              )}

              {tab === "compliance" && showCompliance && (
                <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                  {/* Stripe and the verification provider open in the in-app browser;
                      the screen reloads when it closes or the app regains focus. */}
                  <ComplianceCenterScreen
                    onOpenUrl={(url) => { Browser.open({ url }); }}
                    onOpenWebPath={openPlatformUrl}
                    refreshSignal={browserClosedAt}
                  />
                </Box>
              )}

              {tab === "team" && showTeam && <OrganizationTeam />}

              {tab === "contracts" && showContracts && <OrganizationContracts onOpenWebPath={openPlatformUrl} />}

              {tab === "timesheets" && showTimesheets && (
                <OrganizationTimesheets link={timesheetsLink} onOpenUrl={(url) => { Browser.open({ url }); }} />
              )}

              {tab === "orgReports" && orgReportsEnabled && (
                <OrganizationReports onOpenUrl={(url) => { Browser.open({ url }); }} />
              )}

              {tab === "billing" && showBilling && (
                <OrganizationBilling
                  onOpenUrl={(url) => { Browser.open({ url }); }}
                  onOpenWebPath={openPlatformUrl}
                  onOpenTimesheets={showTimesheets
                    ? ({ startDate, userId }) => { setTimesheetsLink({ startDate, userId }); setTab("timesheets"); }
                    : undefined}
                  refreshSignal={browserClosedAt}
                />
              )}

              {tab === "time" && (
                <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                  <WorkDiaryScreen onOpenUrl={openPlatformUrl} />
                </Box>
              )}

              {tab === "files" && (
                <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", p: 2 }}>
                  <FilesList onOpenUrl={openFile} hideHeader />
                </Box>
              )}
            </Box>
            <BottomNav
              tab={tab}
              onChange={setTab}
              alertsUnread={alertsUnread}
              showHome={showHome}
            />
          </>
        )}
      </Box>

      {isAdmin && (
        <TeamDialog
          open={teamDialogOpen}
          onClose={() => setTeamDialogOpen(false)}
          team={teamToEdit}
          onSaved={onTeamSaved}
        />
      )}
    </ChatProvider>
  );
};

export default Messenger;
