"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FeaturedImageField } from "@/components/news/featured-image-field";
import { TipTapEditor, emptyDoc } from "@/components/news/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { uploadMedia } from "@/api/media";
import type { News, NewsStatus, TipTapDoc } from "@/api/types";
import { usePlatform } from "@/lib/platform/context";

export type NewsFormValues = {
  title: string;
  summary: string;
  featured_image: string;
  status: NewsStatus;
  content: TipTapDoc;
};

type NewsFormProps = {
  newsId: number;
  initial?: Partial<News>;
  submitLabel: string;
  onSubmit: (values: NewsFormValues) => Promise<void>;
};

export function NewsForm({
  newsId,
  initial,
  submitLabel,
  onSubmit,
}: NewsFormProps) {
  const { platform } = usePlatform();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [featuredImage, setFeaturedImage] = useState(
    initial?.featured_image ?? "",
  );
  const [status, setStatus] = useState<NewsStatus>(initial?.status ?? "draft");
  const [content, setContent] = useState<TipTapDoc>(
    initial?.content ?? emptyDoc,
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(file: File, asFeatured = false) {
    if (!platform) {
      toast.error("Select a platform first");
      return null;
    }
    setUploading(true);
    try {
      const media = await uploadMedia(platform.name, file, newsId);
      if (asFeatured) setFeaturedImage(media.url);
      if (!asFeatured) toast.success("Image added");
      else toast.success("Featured image uploaded");
      return media.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!title.trim()) {
          toast.error("Title is required");
          return;
        }
        setSaving(true);
        try {
          await onSubmit({
            title: title.trim(),
            summary: summary.trim(),
            featured_image: featuredImage.trim(),
            status,
            content,
          });
        } finally {
          setSaving(false);
        }
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            value={status}
            onChange={(next) => setStatus(next as NewsStatus)}
            options={[
              { value: "draft", label: "Draft" },
              { value: "published", label: "Published" },
            ]}
          />
        </div>

        <FeaturedImageField
          value={featuredImage}
          disabled={!platform || uploading}
          onUpload={(file) => handleUpload(file, true)}
          onClear={() => setFeaturedImage("")}
        />

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="summary">Summary</Label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <TipTapEditor
          value={content}
          onChange={setContent}
          uploading={uploading}
          onUploadImage={(file) => handleUpload(file, false)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={saving || uploading}>
          {saving ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
