"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { login as loginRequest } from "@/api/auth";
import {
  clearSession,
  getAccessToken,
  getStoredEmail,
  setSession,
} from "@/lib/auth/storage";

type AuthContextValue = {
  email: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  establishSession: (access: string, refresh: string, email: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    const storedEmail = getStoredEmail();
    if (token && storedEmail) {
      setEmail(storedEmail);
    }
    setIsReady(true);
  }, []);

  const login = useCallback(async (nextEmail: string, password: string) => {
    const tokens = await loginRequest(nextEmail, password);
    setSession(tokens.access, tokens.refresh, nextEmail);
    setEmail(nextEmail);
  }, []);

  const establishSession = useCallback(
    (access: string, refresh: string, nextEmail: string) => {
      setSession(access, refresh, nextEmail);
      setEmail(nextEmail);
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();
    setEmail(null);
  }, []);

  const value = useMemo(
    () => ({
      email,
      isAuthenticated: Boolean(email && getAccessToken()),
      isReady,
      login,
      establishSession,
      logout,
    }),
    [email, isReady, login, establishSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
