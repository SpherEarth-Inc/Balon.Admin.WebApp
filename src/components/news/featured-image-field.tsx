"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FeaturedImageFieldProps = {
  value: string;
  label?: string;
  disabled?: boolean;
  onUpload: (file: File) => Promise<string | null>;
  onClear: () => void | Promise<void>;
};

export function FeaturedImageField({
  value,
  label = "Featured image",
  disabled,
  onUpload,
  onClear,
}: FeaturedImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [broken, setBroken] = useState(false);

  async function pickFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/") || disabled || busy) return;
    setBusy(true);
    setBroken(false);
    try {
      await onUpload(file);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2 md:col-span-2">
      <Label>{label}</Label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={disabled || busy}
        onChange={async (e) => {
          await pickFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {value && !broken ? (
        <div className="overflow-hidden rounded-none border border-border bg-white">
          <div className="relative aspect-[16/9] w-full bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Featured"
              className="absolute inset-0 size-full object-cover"
              onError={() => setBroken(true)}
            />
          </div>
          <div className="flex flex-wrap gap-2 border-t border-border p-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled || busy}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="size-4" />
              {busy ? "Uploading…" : "Replace"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || busy}
              onClick={() => {
                void onClear();
              }}
            >
              <Trash2 className="size-4 text-red-600" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragging(false);
          }}
          onDrop={async (e) => {
            e.preventDefault();
            setDragging(false);
            await pickFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 border border-dashed border-border bg-white px-4 py-10 text-center transition-colors",
            dragging && "border-brand-green bg-brand-green/5",
            (disabled || busy) && "opacity-50",
          )}
        >
          <ImagePlus className="size-8 text-brand-green" />
          <span className="font-heading text-sm font-bold uppercase tracking-wide text-brand-navy">
            {busy ? "Uploading…" : `Add ${label.toLowerCase()}`}
          </span>
          <span className="text-xs text-muted-foreground">
            Click to browse or drag & drop
          </span>
          {broken && value ? (
            <span className="text-xs text-red-600">
              Could not load image — try uploading again
            </span>
          ) : null}
        </button>
      )}
    </div>
  );
}
