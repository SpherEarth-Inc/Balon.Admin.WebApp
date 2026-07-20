"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { createNews } from "@/api/news";
import { emptyDoc } from "@/components/news/tiptap-editor";
import { usePlatform } from "@/lib/platform/context";
import { formatPlatformLabel } from "@/lib/utils";

/** Creates a draft, then opens the editor. */
export default function NewNewsPage() {
  const { platform } = usePlatform();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!platform || started.current) return;
    started.current = true;

    createNews({
      platform: platform.name,
      title: "Untitled",
      summary: "",
      status: "draft",
      content: emptyDoc,
    })
      .then((created) => {
        router.replace(`/news/${created.id}`);
      })
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : "Could not create draft";
        setError(message);
        toast.error(message);
        started.current = false;
      });
  }, [platform, router]);

  const crumb = (
    <Breadcrumb
      items={[
        { label: "Dashboard", href: "/dashboard" },
        ...(platform
          ? [
              {
                label: formatPlatformLabel(platform.name),
                href: `/dashboard/platform/${encodeURIComponent(platform.name)}`,
              },
            ]
          : []),
        { label: "News", href: "/news" },
        { label: "New article" },
      ]}
    />
  );

  if (!platform) {
    return (
      <div className="space-y-3">
        {crumb}
        <div className="rounded-none border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Select a platform in the top bar before creating news.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        {crumb}
        <p className="text-sm text-red-700">{error}</p>
        <button
          type="button"
          className="text-sm font-medium text-brand-green hover:underline"
          onClick={() => {
            setError(null);
            started.current = false;
            router.refresh();
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {crumb}
      <p className="text-sm text-muted-foreground">
        Opening a new article for {formatPlatformLabel(platform.name)}…
      </p>
    </div>
  );
}
