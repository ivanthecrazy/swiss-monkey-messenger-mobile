// @regimenthq/messenger-core ships as JS (no types). Loose declarations so the
// TypeScript build resolves it. Tighten these as the integration stabilises.
declare module "@regimenthq/messenger-core" {
  import { ComponentType, ReactNode } from "react";

  export const ChatProvider: ComponentType<{ currentUser: unknown; children: ReactNode }>;
  export const ChatsList: ComponentType<{
    chats: any[];
    onChatSelected: (chat: any) => void;
    selectedChatId: number | null;
    // Optional pinned row above the list (the task assistant tab). Null hides it.
    topItem?: { title?: string; subtitle?: string } | null;
    topItemSelected?: boolean;
    onTopItemSelected?: () => void;
  }>;
  export const Conversation: ComponentType<{
    chat: any;
    onMessageReceived?: (message: any) => void;
    allowReopen?: boolean;
    hideZoomMeetingButton?: boolean;
    // Scrolls to this message and flashes it once the timeline has loaded,
    // fetching older pages if it isn't on the first one.
    focusMessageId?: number | null;
    // Suppress the Conversation's own header title (the shell shows it elsewhere).
    hideTitle?: boolean;
  }>;

  export type AssistantTask = {
    id: number;
    signal: string;
    description: string;
    detected_at: string;
    due_at: string | null;
    chat_id: number;
    source_message_id: number;
    group: { key: string; label: string; kind: string };
  };

  export type AssistantTasksData = {
    enabled: boolean;
    tasks: AssistantTask[];
    open_count: number;
    signals: { key: string; summary: string }[];
    limits: string[];
    copy: {
      tab_title: string;
      explainer_title: string;
      empty_title: string;
      empty_body: string;
    };
  };

  // All wording arrives in `data` from the server — never hardcode it in a shell,
  // since the signal list reflects what is actually running for that user.
  export const AssistantTasksPanel: ComponentType<{
    data: AssistantTasksData;
    onOpenSource: (chatId: number, messageId: number) => void;
    onTasksChanged: (remaining: AssistantTask[]) => void;
  }>;

  export function useAssistantTasks(): {
    enabled: boolean;
    data: AssistantTasksData | null;
    tasks: AssistantTask[];
    openCount: number;
    topItem: { title?: string; subtitle?: string } | null;
    reload: () => Promise<void>;
    onTasksChanged: (remaining: AssistantTask[]) => void;
  };

  export function configureChatApi(opts: {
    baseURL?: string;
    token?: string;
    client?: string;
    platform?: string;
    getAppVersion?: () => string;
    onUnauthorized?: () => void;
  }): void;
  export function configureMessenger(config: Record<string, unknown>): void;
  export function subscribeToUserChannel(
    consumer: unknown,
    handlers?: { onMention?: (m: any) => void; onCvExtraction?: (c: any) => void },
  ): () => void;
  export function fetchChats(page?: number, search?: Record<string, unknown>): Promise<any>;
  export const TeamDialog: ComponentType<{
    open: boolean;
    onClose: () => void;
    team?: any;
    onSaved?: (chat: any) => void;
  }>;
  export function triggerUnreadChatsLoadedEvent(count: number): void;

  // Grouped chat list (announcements / org threads / teams / support) + Contact
  // support button. Self-contained: fetches /chats/grouped and refetches on events.
  export const GroupedChatsList: ComponentType<{
    currentUser: unknown;
    selectedChatId: number | null;
    onChatSelected: (chat: any) => void;
    refreshSignal?: number;
  }>;

  // The Alerts inbox. Navigation is delegated to the host.
  export const NotificationsList: ComponentType<{
    currentUserId?: number;
    onOpenChat?: (chatId: number, messageId?: number) => void;
    onOpenUrl?: (path: string) => void;
    onUnreadChange?: (count: number) => void;
    onOpenAttachment?: (url: string) => void;
    hideHeader?: boolean;
  }>;

  // Tabbed search results (Conversations + Messages). Host owns the input.
  export const SearchResultsPanel: ComponentType<{
    query: string;
    currentUser: unknown;
    onOpenChat?: (chatId: number, messageId?: number) => void;
  }>;

  // A pro's Work Diary: their active positions, then the chosen one's timesheet and
  // manual time requests. Web pages (ID verification) open through onOpenUrl.
  export const WorkDiaryScreen: ComponentType<{
    onOpenUrl?: (path: string) => void;
    displayCurrency?: string;
  }>;
  export function fetchDiaryPositions(): Promise<any[]>;

  // A pro's productivity reports: their daily reports across every practice, then one
  // report — read, or edited while it is this week's (GET /api/productivity_logs, …).
  // Attachments open through onOpenFile (an absolute URL).
  export const ProductivityReportsScreen: ComponentType<{
    currentUserId?: number;
    currency?: string;
    onOpenFile?: (url: string) => void;
    // Show this report (one picked on Home); a new object opens it again.
    openReport?: { organizationSlug: string; id: number };
  }>;

  // A pro's Payments page: the Stripe payout account and the payment history
  // (GET /api/payments). Stripe pages and invoices open through onOpenUrl; the screen
  // reloads when the window regains focus (the pro coming back from Stripe).
  export const PaymentsScreen: ComponentType<{
    displayCurrency?: string;
    onOpenUrl: (url: string) => void;
    // Any value; a change reloads the page (e.g. when an in-app browser closes).
    refreshSignal?: unknown;
  }>;

  // "All Files" across the user's conversations. Downloads delegated to the host.
  export const FilesList: ComponentType<{
    onOpenUrl?: (url: string) => void;
    hideHeader?: boolean;
  }>;

  // A pro's Home: the onboarding checklist and their offices (GET /api/dashboard).
  // Links to web pages are resolved to signed-in handoff URLs before openExternal.
  export const ContractorDashboardScreen: ComponentType<{
    openExternal: (url: string) => void;
    // The checklist's profile links (/p/:id) open the in-app profile instead.
    onOpenProfile?: () => void;
    // Report links (/organizations/:slug/productivity_logs[/:id]) open the in-app
    // reports instead: null for the list, the report otherwise.
    onOpenReports?: (report: { organizationSlug: string; id: number } | null) => void;
    // Compliance center links (/compliance_center) open the in-app one instead.
    onOpenComplianceCenter?: () => void;
  }>;

  // A web path → a one-time signed-in handoff URL (POST /api/web_sessions); absolute
  // and mailto: links come back as is. Expires in a minute: open it straight away.
  export function resolveWebLink(href: string): Promise<string>;

  // Signing up as an office (ENABLE_APP_SIGNUP), before anyone is signed in: the form, then
  // the emailed code. Point the chat API at /api without a token first.
  export const SignupScreen: ComponentType<{
    deviceName?: string;
    onAuthenticated: (session: { token: string; user: any }) => void;
    onOpenUrl: (url: string) => void;
    onSignIn: () => void;
  }>;

  // Rejects (404) while signing up in the app is switched off.
  export const fetchSignupOptions: () => Promise<unknown>;

  // Holds an office user whose practice isn't set up on plan / payment / authorization;
  // renders the app for everyone else.
  export const OnboardingGate: ComponentType<{
    user: unknown;
    cardPayment?: boolean;
    onOpenUrl: (url: string) => void;
    onOpenWebPath: (path: string) => void;
    onLogout: () => void;
    onPaid?: () => void;
    onCompleted?: (organization: { slug: string }) => void;
    onHeldChange?: (held: boolean) => void;
    refreshSignal?: unknown;
    // Subscribes the user's cable while a professional is held; returns the unsubscribe.
    connectRealtime?: () => () => void;
    sx?: object;
    children: ReactNode;
  }>;

  // An office user's Home: their current organization's dashboard (ENABLE_APP_DASHBOARD).
  export const OrganizationHomeScreen: ComponentType<{
    organization: { slug: string; name: string };
    onOpenUrl: (url: string) => void;
    onOpenWebPath: (path: string) => void;
    onOpenReports?: () => void;
  }>;

  // The pro's own profile, editable in place (GET /api/profile/edit). Mount it in a
  // scrolling panel; web-only links go through the sign-in handoff to openExternal.
  export const OwnProfileScreen: ComponentType<{
    openExternal: (url: string) => void;
    // Compliance center links (/compliance_center) open the in-app one instead.
    onOpenComplianceCenter?: () => void;
  }>;

  // A pro's Compliance Center: identity verification, background check, HIPAA and
  // PIPEDA/PHIPA certificates and legal agreements (GET /api/compliance_center).
  // Stripe Checkout, the verification provider and certificates open through
  // onOpenUrl; the screen reloads when the window regains focus (the pro coming back).
  export const ComplianceCenterScreen: ComponentType<{
    onOpenUrl: (url: string) => void;
    // A web path to open signed in (an agreement to save or print).
    onOpenWebPath?: (path: string) => void;
    // Any value; a change reloads the page (e.g. when an in-app browser closes).
    refreshSignal?: unknown;
  }>;

  // An organization's Billing & Payments (GET /api/organizations/:slug/billing, for
  // members with view_billing). The Stripe Billing Portal opens through onOpenUrl;
  // receipts and timesheets through onOpenWebPath. Reloads when the window regains focus.
  // An organization's Team Members (GET /api/organizations/:slug/team, for members who
  // may manage the team): list, invite, edit, access level, remove, a professional's
  // schedule and report metrics. Loads its own data.
  export const OrganizationTeamScreen: ComponentType<{ slug: string }>;

  // The organization's Contracts (ENABLE_APP_ORG_CONTRACTS): search, status filter, rate,
  // weekly limit, toolkit, BAA, bonus, closing and rehiring. Loads its own data; web pages
  // (an office's playbook, a job) open through onOpenWebPath.
  export const OrganizationContractsScreen: ComponentType<{ slug: string; onOpenWebPath?: (path: string) => void }>;

  export const OrganizationBillingScreen: ComponentType<{
    slug: string;
    onOpenUrl: (url: string) => void;
    onOpenWebPath: (path: string) => void;
    // A pending row's timer icon: the app's own Timesheets on that week and professional.
    onOpenTimesheets?: (target: { slug: string; startDate: string; userId: number | string }) => void;
    // Any value; a change reloads the page (e.g. when an in-app browser closes).
    refreshSignal?: unknown;
  }>;

  // The organization's Productivity Reports (ENABLE_APP_ORG_REPORTS): every professional's
  // daily reports, then one to read. Key it by the slug. Attachments open through onOpenFile.
  export const OrganizationReportsScreen: ComponentType<{
    slug: string;
    currency?: string;
    currentUserId?: number;
    isAdmin?: boolean;
    onOpenFile: (url: string) => void;
  }>;

  // The organization's Timesheets (ENABLE_APP_ORG_TIMESHEETS): the week per professional,
  // their sessions, Give Bonus and the manual time requests. Loads its own data.
  export const OrganizationTimesheetsScreen: ComponentType<{
    slug: string;
    startDate?: string | null;
    userId?: number | string | null;
    onOpenUrl?: (url: string) => void;
  }>;
}

declare module "@rails/actioncable" {
  export function createConsumer(url: string): {
    disconnect: () => void;
    subscriptions: any;
  };
}
