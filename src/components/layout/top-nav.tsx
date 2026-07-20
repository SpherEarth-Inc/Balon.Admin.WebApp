"use client";

import Link from "next/link";
import { PlatformSwitcher } from "@/components/layout/platform-switcher";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { usePlatform } from "@/lib/platform/context";
import { formatPlatformLabel } from "@/lib/utils";

export function TopNav() {
  const { platform } = usePlatform();
  const platformLabel = platform
    ? formatPlatformLabel(platform.name)
    : "Terra";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="shrink-0 font-heading text-sm font-bold uppercase tracking-wide text-brand-navy"
        >
          {platformLabel} <span className="text-brand-green">Staff</span>
        </Link>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <PlatformSwitcher />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
