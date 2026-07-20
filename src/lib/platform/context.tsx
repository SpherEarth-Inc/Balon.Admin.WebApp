"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { listPlatforms } from "@/api/platforms";
import type { Platform } from "@/api/types";
import { useAuth } from "@/lib/auth/context";
import {
  clearStoredPlatformId,
  getStoredPlatformId,
  setStoredPlatformId,
} from "@/lib/auth/storage";

type PlatformContextValue = {
  platforms: Platform[];
  platform: Platform | null;
  isLoading: boolean;
  error: string | null;
  setPlatformId: (id: number) => void;
  refresh: () => Promise<void>;
};

const PlatformContext = createContext<PlatformContextValue | null>(null);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [platformId, setPlatformIdState] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setPlatforms([]);
      setPlatformIdState(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await listPlatforms();
      const active = data.filter((p) => p.is_active);
      setPlatforms(active);

      const stored = getStoredPlatformId();
      const stillValid = active.some((p) => p.id === stored);
      const nextId = stillValid ? stored : (active[0]?.id ?? null);

      if (nextId != null) {
        setPlatformIdState(nextId);
        setStoredPlatformId(nextId);
      } else {
        setPlatformIdState(null);
        clearStoredPlatformId();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load platforms");
      setPlatforms([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isReady) return;
    void refresh();
  }, [isReady, refresh]);

  const setPlatformId = useCallback((id: number) => {
    setPlatformIdState(id);
    setStoredPlatformId(id);
  }, []);

  const platform = useMemo(
    () => platforms.find((p) => p.id === platformId) ?? null,
    [platforms, platformId],
  );

  const value = useMemo(
    () => ({
      platforms,
      platform,
      isLoading,
      error,
      setPlatformId,
      refresh,
    }),
    [platforms, platform, isLoading, error, setPlatformId, refresh],
  );

  return (
    <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>
  );
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform must be used within PlatformProvider");
  return ctx;
}
