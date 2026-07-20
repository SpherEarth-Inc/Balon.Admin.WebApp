"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FileText, ImageIcon } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageSpinner } from "@/components/ui/spinner";
import { usePlatform } from "@/lib/platform/context";
import { formatPlatformLabel } from "@/lib/utils";

const cards = [
  {
    href: "/news",
    title: "News",
    description: "Write and publish stories for this site.",
    icon: FileText,
  },
  {
    href: "/media",
    title: "Media",
    description: "See images used in your news articles.",
    icon: ImageIcon,
  },
];

export default function PlatformDashboardPage() {
  const params = useParams<{ platformName: string }>();
  const router = useRouter();
  const { platforms, platform, setPlatformId, isLoading, error } = usePlatform();
  const platformName = decodeURIComponent(params.platformName ?? "");

  useEffect(() => {
    if (isLoading || !platformName) return;
    const match = platforms.find(
      (p) => p.name.toLowerCase() === platformName.toLowerCase(),
    );
    if (!match) {
      router.replace("/dashboard");
      return;
    }
    if (platform?.id !== match.id) {
      setPlatformId(match.id);
    }
  }, [isLoading, platformName, platforms, platform?.id, setPlatformId, router]);

  if (isLoading) {
    return <PageSpinner />;
  }

  const match = platforms.find(
    (p) => p.name.toLowerCase() === platformName.toLowerCase(),
  );

  if (!match) {
    return <PageSpinner />;
  }

  const label = formatPlatformLabel(match.name);

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label },
          ]}
        />
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-brand-navy">
          {label}
        </h1>
      </div>

      {error ? (
        <div className="rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
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
