"use client";

import Link from "next/link";
import { FileText, ImageIcon, Users } from "lucide-react";
import { PageSpinner } from "@/components/ui/spinner";
import { useSession } from "@/lib/session/context";

export default function DashboardPage() {
  const {
    canViewStaff,
    canAccessWebsiteNews,
    canAccessSoccerNews,
    canAccessWebsiteMedia,
    canAccessSoccerMedia,
    isLoading: sessionLoading,
  } = useSession();

  if (sessionLoading) {
    return <PageSpinner />;
  }

  const hasAnyCard =
    canViewStaff ||
    canAccessWebsiteNews ||
    canAccessSoccerNews ||
    canAccessWebsiteMedia ||
    canAccessSoccerMedia;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-brand-navy">
          Dashboard
        </h1>
      </div>

      {!hasAnyCard ? (
        <div className="rounded-none border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You do not have access to any tools yet. Ask an administrator for an
          invite or permissions.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {canAccessWebsiteNews ? (
          <Link
            href="/website/news"
            className="rounded-none border border-border bg-white p-5 shadow-sm transition hover:border-brand-green/40 hover:shadow"
          >
            <FileText className="size-5 text-brand-green" />
            <h2 className="mt-3 font-heading text-lg font-bold uppercase tracking-tight text-brand-navy">
              Website News
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Write and publish website stories.
            </p>
          </Link>
        ) : null}

        {canAccessSoccerNews ? (
          <Link
            href="/soccer/news"
            className="rounded-none border border-border bg-white p-5 shadow-sm transition hover:border-brand-green/40 hover:shadow"
          >
            <FileText className="size-5 text-brand-green" />
            <h2 className="mt-3 font-heading text-lg font-bold uppercase tracking-tight text-brand-navy">
              Soccer News
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Write and publish soccer stories.
            </p>
          </Link>
        ) : null}

        {canAccessWebsiteMedia ? (
          <Link
            href="/website/media"
            className="rounded-none border border-border bg-white p-5 shadow-sm transition hover:border-brand-green/40 hover:shadow"
          >
            <ImageIcon className="size-5 text-brand-green" />
            <h2 className="mt-3 font-heading text-lg font-bold uppercase tracking-tight text-brand-navy">
              Website Media
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Images used in website news.
            </p>
          </Link>
        ) : null}

        {canAccessSoccerMedia ? (
          <Link
            href="/soccer/media"
            className="rounded-none border border-border bg-white p-5 shadow-sm transition hover:border-brand-green/40 hover:shadow"
          >
            <ImageIcon className="size-5 text-brand-green" />
            <h2 className="mt-3 font-heading text-lg font-bold uppercase tracking-tight text-brand-navy">
              Soccer Media
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Images used in soccer news.
            </p>
          </Link>
        ) : null}

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
              Find and view staff members.
            </p>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
