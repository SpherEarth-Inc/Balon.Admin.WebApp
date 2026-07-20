"use client";

import Link from "next/link";
import { Layers, Users } from "lucide-react";
import { PageSpinner } from "@/components/ui/spinner";
import { usePlatform } from "@/lib/platform/context";
import { useSession } from "@/lib/session/context";
import { formatPlatformLabel } from "@/lib/utils";

export default function DashboardPage() {
  const { platforms, error, isLoading } = usePlatform();
  const { canViewStaff, isLoading: sessionLoading } = useSession();

  if (isLoading || sessionLoading) {
    return <PageSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-brand-navy">
          Dashboard
        </h1>
      </div>

      {error ? (
        <div className="rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {!error && platforms.length === 0 ? (
        <div className="rounded-none border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You do not have access to any sites yet. Ask an administrator for an
          invite.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {canViewStaff ? (
          <Link
            href="/employees"
            className="rounded-none border border-border bg-white p-5 shadow-sm transition hover:border-brand-green/40 hover:shadow"
          >
            <Users className="size-5 text-brand-green" />
            <h2 className="mt-3 font-heading text-lg font-bold uppercase tracking-tight text-brand-navy">
              Employee
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Find and view staff across your sites.
            </p>
          </Link>
        ) : null}

        {platforms.map((p) => (
          <Link
            key={p.id}
            href={`/dashboard/platform/${encodeURIComponent(p.name)}`}
            className="rounded-none border border-border bg-white p-5 shadow-sm transition hover:border-brand-green/40 hover:shadow"
          >
            <Layers className="size-5 text-brand-green" />
            <h2 className="mt-3 font-heading text-lg font-bold uppercase tracking-tight text-brand-navy">
              {formatPlatformLabel(p.name)}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              News, media, and site tools.
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
