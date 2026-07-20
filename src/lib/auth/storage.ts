const ACCESS_KEY = "terra_admin_access";
const REFRESH_KEY = "terra_admin_refresh";
const EMAIL_KEY = "terra_admin_email";
const PLATFORM_KEY = "terra_admin_platform_id";

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
}

export function getStoredPlatformId() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PLATFORM_KEY);
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

export function setStoredPlatformId(id: number) {
  localStorage.setItem(PLATFORM_KEY, String(id));
}

export function clearStoredPlatformId() {
  localStorage.removeItem(PLATFORM_KEY);
}
