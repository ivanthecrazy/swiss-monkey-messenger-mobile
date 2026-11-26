import { getTokenStore } from "@regimenthq/shell-auth";

// The server no longer accepts our token: it expired, or the account was deactivated.
export const endSession = () => {
  getTokenStore().clear();
  window.location.href = "/login";
};
