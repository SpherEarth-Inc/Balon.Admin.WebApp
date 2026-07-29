"use client";

import Link from "next/link";
import { ProfileMenu } from "@/components/layout/profile-menu";

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="shrink-0 font-heading text-sm font-bold uppercase tracking-wide text-brand-navy"
        >
          Staff <span className="text-brand-green">Buddy</span>
        </Link>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
