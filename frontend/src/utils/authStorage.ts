const REFRESH_TOKEN_KEY = 'medconnect_refresh_token';

export function getStoredRefreshToken(): string | null {
  try {
    const token = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    return token;
  } catch {
    return null;
  }
}

export function setStoredRefreshToken(token: string | null) {
  try {
    if (token) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch {
    // sessionStorage may be unavailable in some private-browsing contexts
  }
}

export function clearStoredRefreshToken() {
  try {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // ignore
  }
}
