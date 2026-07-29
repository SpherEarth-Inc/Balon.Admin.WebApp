"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { createNews } from "@/api/news";
import { emptyDoc } from "@/components/news/tiptap-editor";

/** Creates a draft, then opens the editor. */
export function NewsNew() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    createNews({
      title: "Untitled",
      summary: "",
      status: "draft",
      content: emptyDoc,
    })
      .then((created) => {
        router.replace(`/news/edit/?id=${created.id}`);
      })
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : "Could not create draft";
        setError(message);
        toast.error(message);
        started.current = false;
      });
  }, [router, attempt]);

  const crumb = (
    <Breadcrumb
      items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "News", href: "/news/" },
        { label: "New article" },
      ]}
    />
  );

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
            setAttempt((n) => n + 1);
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
      <p className="text-sm text-muted-foreground">Opening a new article…</p>
    </div>
  );
}
