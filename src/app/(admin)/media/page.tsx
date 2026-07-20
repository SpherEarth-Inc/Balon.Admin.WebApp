"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { listMedia } from "@/api/media";
import type { MediaItem } from "@/api/types";
import { PageSpinner } from "@/components/ui/spinner";
import { usePlatform } from "@/lib/platform/context";
import { formatDate, formatPlatformLabel } from "@/lib/utils";

export default function MediaPage() {
  const { platform } = usePlatform();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!platform) {
      setItems([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    listMedia(platform.name)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to load media");
          setItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [platform]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-brand-navy">
          Media
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Images used in{" "}
          {platform ? formatPlatformLabel(platform.name) : "this site"} news.
          Add or change them when you{" "}
          <Link
            href="/news"
            className="font-medium text-brand-green hover:underline"
          >
            edit a news article
          </Link>
          .
        </p>
      </div>

      {loading ? (
        <PageSpinner />
      ) : items.length === 0 ? (
        <div className="rounded-none border border-dashed border-border bg-white px-6 py-12 text-center text-sm text-muted-foreground">
          No images yet. Open a news article to add some.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-none border border-border bg-white shadow-sm"
            >
              {item.mime_type.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt={item.file_name}
                  className="h-40 w-full object-cover bg-muted"
                />
              ) : (
                <div className="flex h-40 items-center justify-center bg-muted text-sm text-muted-foreground">
                  File
                </div>
              )}
              <div className="space-y-2 p-4">
                <h2 className="truncate text-sm font-medium text-brand-navy">
                  {item.file_name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {formatDate(item.created_at)}
                </p>
                <button
                  type="button"
                  className="text-sm font-medium text-brand-green hover:underline"
                  onClick={async () => {
                    await navigator.clipboard.writeText(item.url);
                    toast.success("Link copied");
                  }}
                >
                  Copy link
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
