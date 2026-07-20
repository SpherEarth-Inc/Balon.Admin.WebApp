"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getMe } from "@/api/account";
import type { MeResponse } from "@/api/types";
import { useAuth } from "@/lib/auth/context";

type SessionContextValue = {
  me: MeResponse | null;
  isLoading: boolean;
  isSuperAdmin: boolean;
  permissions: string[];
  canViewStaff: boolean;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setMe(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getMe();
      setMe(data);
    } catch {
      setMe(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isReady) return;
    void refresh();
  }, [isReady, refresh]);

  const permissions = me?.permissions ?? [];
  const isSuperAdmin = Boolean(me?.is_super_admin);
  const canViewStaff =
    isSuperAdmin || permissions.includes("staff.view");

  const value = useMemo(
    () => ({
      me,
      isLoading,
      isSuperAdmin,
      permissions,
      canViewStaff,
      refresh,
    }),
    [me, isLoading, isSuperAdmin, permissions, canViewStaff, refresh],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
