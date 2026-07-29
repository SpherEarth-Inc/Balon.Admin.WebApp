const ACCESS_KEY = "terra_admin_access";
const REFRESH_KEY = "terra_admin_refresh";
const EMAIL_KEY = "terra_admin_email";

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function getStoredEmail() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EMAIL_KEY);
}

export function setSession(access: string, refresh: string, email: string) {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  localStorage.setItem(EMAIL_KEY, email);
}

export function setAccessToken(access: string) {
  localStorage.setItem(ACCESS_KEY, access);
}

export function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(EMAIL_KEY);
  // Clear legacy platform selection if present
  localStorage.removeItem("terra_admin_platform_id");
}
