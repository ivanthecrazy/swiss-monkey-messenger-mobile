import { useEffect, useSyncExternalStore } from "react";
import { authGet, getTokenStore } from "@regimenthq/shell-auth";

// The app-wide "current organization" for the organization-side pages (Billing first).
// The same store as the desktop shell's (src/services/currentOrganization.ts there).
// The web carries it in the URL (/organizations/:slug/...); the shell has no URL to
// carry it, so it lives here: the organizations from GET /api/organizations, and the
// one picked, remembered per user across launches.
//
// A member gets their own organizations (usually a handful). An admin gets every
// organization on the platform, so the list is only the first page and the picker
// searches the server (`allOrganizations`); an admin's pick can be outside that page.
//
// Pages read the current organization's slug for their /api/organizations/:slug calls
// and its `permissions` (the web's per-member toggles; all of them for an admin) to
// decide what to show; the server checks the same permissions again on every request.

export type OrganizationPermissions = Partial<Record<
  "manage_users" | "view_billing" | "access_reports" | "post_jobs" | "manage_contracts" | "approve_manual_time_requests",
  boolean
>>;

export type Organization = {
  id: number;
  name: string;
  slug: string;
  currency?: string;
  role: "owner" | "manager" | "team" | "admin" | null;
  permissions: OrganizationPermissions;
  has_active_subscription: boolean;
  subscription_status: string;
};

type ListResponse = { organizations?: Organization[]; has_more?: boolean; all_organizations?: boolean };

type State = {
  // Whose organizations these are: the store is reloaded when someone else signs in.
  userId: number | null;
  loaded: boolean;
  // The first page (a member's whole list, as a rule).
  organizations: Organization[];
  hasMore: boolean;
  // An admin: the list is a search over every organization, not memberships.
  allOrganizations: boolean;
  current: Organization | null;
};

const EMPTY: State = {
  userId: null, loaded: false, organizations: [], hasMore: false, allOrganizations: false, current: null,
};
let state: State = EMPTY;
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

const set = (next: State) => {
  state = next;
  listeners.forEach((l) => l());
};

const storedUserId = () => (getTokenStore().getUser() as { id?: number } | null)?.id ?? null;
const storageKey = (userId: number) => `currentOrganization:${userId}`;

const readPicked = (userId: number) => {
  try { return localStorage.getItem(storageKey(userId)); } catch { return null; }
};
const writePicked = (userId: number, slug: string) => {
  try { localStorage.setItem(storageKey(userId), slug); } catch { /* private mode etc. */ }
};

const fetchOne = (slug: string) => authGet<{ organization?: Organization }>(`organizations/${encodeURIComponent(slug)}`)
  .then((body) => body?.organization || null)
  .catch(() => null);

// Organizations matching `query` by name (the picker's search), at most `limit`.
export const searchOrganizations = async (query: string, limit = 50) => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (query.trim()) params.set("q", query.trim());
  const body = await authGet<ListResponse>(`organizations?${params.toString()}`);
  return { organizations: body?.organizations || [], hasMore: body?.has_more === true };
};

// (Re)loads the list. Keeps the picked organization while the user can still open it
// (refreshed, so a permission changed on the web shows), else a member falls back to
// their first organization — so a membership that ended never leaves a page pointing
// at an organization the server would 404. An admin with nothing picked starts with
// none rather than whichever comes first alphabetically.
export const loadOrganizations = (): Promise<void> => {
  const userId = storedUserId();
  if (userId === null) {
    set(EMPTY);
    return Promise.resolve();
  }
  if (inFlight) return inFlight;

  inFlight = authGet<ListResponse>("organizations")
    .then(async (body) => {
      const organizations = body?.organizations || [];
      const hasMore = body?.has_more === true;
      const allOrganizations = body?.all_organizations === true;
      const picked = readPicked(userId) ?? (state.userId === userId ? state.current?.slug : undefined);

      let current = organizations.find((o) => o.slug === picked) || null;
      if (!current && picked && (hasMore || allOrganizations)) current = await fetchOne(picked);
      if (!current && !allOrganizations) current = organizations[0] || null;

      if (storedUserId() !== userId) return; // signed out / switched while loading
      set({
        userId, loaded: true, organizations, hasMore, allOrganizations, current,
      });
    })
    .catch(() => {
      // Keep whatever we had; a page without an organization shows its empty state.
      if (state.userId !== userId) set({ ...EMPTY, userId, loaded: true });
    })
    .finally(() => { inFlight = null; });
  return inFlight;
};

// Picks an organization (from the list or from a search).
export const selectOrganization = (organization: Organization) => {
  if (state.userId === null || organization.slug === state.current?.slug) return;
  writePicked(state.userId, organization.slug);
  set({ ...state, current: organization });
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Loads on first use and again whenever a different user is signed in.
export const useCurrentOrganization = () => {
  const snapshot = useSyncExternalStore(subscribe, () => state);
  const userId = storedUserId();

  useEffect(() => {
    if (!snapshot.loaded || snapshot.userId !== userId) loadOrganizations();
  }, [snapshot.loaded, snapshot.userId, userId]);

  return snapshot.userId === userId ? snapshot : EMPTY;
};
