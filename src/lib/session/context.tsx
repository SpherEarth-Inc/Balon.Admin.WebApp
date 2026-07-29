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
  hasPermission: (codename: string) => boolean;
  canAccessWebsiteNews: boolean;
  canAccessSoccerNews: boolean;
  canAccessWebsiteMedia: boolean;
  canAccessSoccerMedia: boolean;
  canViewStaff: boolean;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function hasAnyPrefix(permissions: string[], prefix: string) {
  return permissions.some((p) => p.startsWith(prefix));
}

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

  const hasPermission = useCallback(
    (codename: string) => isSuperAdmin || permissions.includes(codename),
    [isSuperAdmin, permissions],
  );

  const canAccessWebsiteNews =
    isSuperAdmin || hasAnyPrefix(permissions, "website.news.");
  const canAccessSoccerNews =
    isSuperAdmin || hasAnyPrefix(permissions, "soccer.news.");
  const canAccessWebsiteMedia =
    isSuperAdmin || hasAnyPrefix(permissions, "website.media.");
  const canAccessSoccerMedia =
    isSuperAdmin || hasAnyPrefix(permissions, "soccer.media.");
  const canViewStaff = isSuperAdmin || permissions.includes("staff.view");

  const value = useMemo(
    () => ({
      me,
      isLoading,
      isSuperAdmin,
      permissions,
      hasPermission,
      canAccessWebsiteNews,
      canAccessSoccerNews,
      canAccessWebsiteMedia,
      canAccessSoccerMedia,
      canViewStaff,
      refresh,
    }),
    [
      me,
      isLoading,
      isSuperAdmin,
      permissions,
      hasPermission,
      canAccessWebsiteNews,
      canAccessSoccerNews,
      canAccessWebsiteMedia,
      canAccessSoccerMedia,
      canViewStaff,
      refresh,
    ],
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
