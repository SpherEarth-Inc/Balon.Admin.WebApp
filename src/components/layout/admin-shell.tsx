"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/top-nav";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth/context";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isReady, pathname, router]);

  if (!isReady || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <TopNav />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
