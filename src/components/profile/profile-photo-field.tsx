"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2, Upload, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ProfilePhotoFieldProps = {
  value: string;
  label?: string;
  disabled?: boolean;
  onUpload: (file: File) => Promise<string | null>;
  onClear: () => void | Promise<void>;
};

export function ProfilePhotoField({
  value,
  label = "Profile photo",
  disabled,
  onUpload,
  onClear,
}: ProfilePhotoFieldProps) {
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

  const showPhoto = Boolean(value) && !broken;

  return (
    <div className="flex flex-col items-center gap-3">
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
          "relative flex size-28 items-center justify-center overflow-hidden rounded-full border border-dashed border-border bg-muted transition-colors",
          dragging && "border-brand-green bg-brand-green/5",
          (disabled || busy) && "opacity-50",
          showPhoto && "border-solid border-border",
        )}
        aria-label={showPhoto ? "Replace profile photo" : "Add profile photo"}
      >
        {showPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Profile"
            className="absolute inset-0 size-full object-cover"
            onError={() => setBroken(true)}
          />
        ) : (
          <span className="flex flex-col items-center gap-1 text-muted-foreground">
            {busy ? (
              <ImagePlus className="size-7 animate-pulse text-brand-green" />
            ) : (
              <UserRound className="size-8" />
            )}
          </span>
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        {busy
          ? "Uploading…"
          : broken && value
            ? "Could not load image — try uploading again"
            : "Click the circle or drag & drop a photo"}
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" />
          {busy ? "Uploading…" : showPhoto ? "Replace" : "Upload"}
        </Button>
        {showPhoto ? (
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
        ) : null}
      </div>
    </div>
  );
}
