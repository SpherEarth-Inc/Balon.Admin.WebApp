"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { deleteNews, listNews } from "@/api/news";
import type { News, NewsStatus } from "@/api/types";
import { usePlatform } from "@/lib/platform/context";
import { formatDate, formatPlatformLabel } from "@/lib/utils";

export default function NewsListPage() {
  const { platform } = usePlatform();
  const [items, setItems] = useState<News[]>([]);
  const [status, setStatus] = useState<NewsStatus | "">("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!platform) {
      setItems([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    listNews(platform.name, status || undefined)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to load news");
          setItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [platform, status]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
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
              { label: "News" },
            ]}
          />
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-brand-navy">
            News
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stories for{" "}
            {platform ? formatPlatformLabel(platform.name) : "this site"}.
          </p>
        </div>
        <Link
          href="/news/new"
          className="inline-flex h-10 items-center gap-2 rounded-none bg-brand-green px-4 text-sm font-medium text-white hover:bg-brand-green/90"
        >
          <Plus className="size-4" />
          New article
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Select
          className="w-44"
          value={status}
          onChange={(next) => setStatus(next as NewsStatus | "")}
          options={[
            { value: "", label: "All statuses" },
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
          ]}
        />
      </div>

      <div className="overflow-hidden rounded-none border border-border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">
                Updated
              </th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8">
                  <div className="flex justify-center">
                    <Spinner />
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No articles yet for this platform.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-brand-navy">{item.title}</div>
                  </td>
                  <td className="px-4 py-3 capitalize">{item.status}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {formatDate(item.updated_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/news/${item.id}`}
                        className="text-sm font-medium text-brand-green hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="text-sm font-medium text-red-600 hover:underline"
                        onClick={async () => {
                          if (!confirm(`Delete “${item.title}”?`)) return;
                          try {
                            await deleteNews(item.id);
                            setItems((prev) => prev.filter((n) => n.id !== item.id));
                            toast.success("Deleted");
                          } catch (err) {
                            toast.error(
                              err instanceof Error ? err.message : "Delete failed",
                            );
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
