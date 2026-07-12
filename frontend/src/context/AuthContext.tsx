import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthUser, LoginPayload } from '@/types/auth.types';
import * as authService from '@/services/auth.service';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  adminLogin: (payload: LoginPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first mount, try to silently restore a session using the httpOnly
  // refresh cookie. This is what makes "stay logged in" work across page
  // reloads even though the access token itself only lives in memory.
  useEffect(() => {
    let cancelled = false;

    authService.tryRestoreSession().then((restoredUser) => {
      if (!cancelled) {
        setUser(restoredUser);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // The axios interceptor dispatches this when a refresh attempt fails
  // mid-session (e.g. token was revoked, or genuinely expired) — clear
  // local user state so protected routes redirect to login.
  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener('medconnect:session-expired', handler);
    return () => window.removeEventListener('medconnect:session-expired', handler);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await authService.login(payload);
    setUser(result.user);
    return result.user;
  }, []);

  const adminLogin = useCallback(async (payload: LoginPayload) => {
    const result = await authService.adminLogin(payload);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      adminLogin,
      logout,
      setUser,
    }),
    [user, isLoading, login, adminLogin, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
