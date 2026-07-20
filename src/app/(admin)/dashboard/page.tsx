"use client";

import Link from "next/link";
import { FileText, ImageIcon, UserPlus } from "lucide-react";
import { PageSpinner } from "@/components/ui/spinner";
import { usePlatform } from "@/lib/platform/context";

const cards = [
  {
    href: "/news",
    title: "News",
    description: "Write and publish stories for the site you selected.",
    icon: FileText,
  },
  {
    href: "/media",
    title: "Media",
    description: "See images used in your news articles.",
    icon: ImageIcon,
  },
  {
    href: "/invites",
    title: "Invites",
    description: "Invite teammates to help manage this site.",
    icon: UserPlus,
  },
];

export default function DashboardPage() {
  const { platforms, error, isLoading } = usePlatform();

  if (isLoading) {
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
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-none border border-border bg-white p-5 shadow-sm transition hover:border-brand-green/40 hover:shadow"
          >
            <card.icon className="size-5 text-brand-green" />
            <h2 className="mt-3 font-heading text-lg font-bold uppercase tracking-tight text-brand-navy">
              {card.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
