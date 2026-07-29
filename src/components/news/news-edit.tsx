"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { NewsForm } from "@/components/news/news-form";
import { PageSpinner } from "@/components/ui/spinner";
import { getNews, updateNews } from "@/api/news";
import type { News } from "@/api/types";

export function NewsEdit() {
  const searchParams = useSearchParams();
  const newsId = searchParams.get("id");
  const router = useRouter();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!newsId) {
      router.replace("/news/");
      return;
    }

    let cancelled = false;
    setLoading(true);
    getNews(newsId)
      .then((data) => {
        if (!cancelled) setNews(data);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to load");
          router.replace("/news/");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [newsId, router]);

  if (loading) {
    return <PageSpinner />;
  }

  if (!news) return null;

  return (
    <div className="space-y-5">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "News", href: "/news/" },
            { label: news.title || "Edit article" },
          ]}
        />
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-brand-navy">
          Edit article
        </h1>
      </div>

      <div className="rounded-none border border-border bg-white p-5 shadow-sm sm:p-6">
        <NewsForm
          newsId={news.id}
          initial={news}
          submitLabel="Save changes"
          onSubmit={async (values) => {
            try {
              const updated = await updateNews(news.id, {
                title: values.title,
                summary: values.summary,
                featured_image: values.featured_image || null,
                status: values.status,
                content: values.content,
              });
              setNews(updated);
              toast.success("Saved");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Save failed");
              throw err;
            }
          }}
        />
      </div>
    </div>
  );
}
