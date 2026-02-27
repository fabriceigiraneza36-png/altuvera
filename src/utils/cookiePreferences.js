export const COOKIE_PREFS_KEY = "altuvera_cookie_preferences";
export const OPEN_COOKIE_SETTINGS_EVENT = "altuvera:open-cookie-settings";

export const openCookieSettings = () => {
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
};

export const readCookiePreferences = () => {
  const raw = localStorage.getItem(COOKIE_PREFS_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

