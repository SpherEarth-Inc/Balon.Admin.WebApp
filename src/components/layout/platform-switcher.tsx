"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Layers } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Spinner } from "@/components/ui/spinner";
import type { Platform } from "@/api/types";
import { usePlatform } from "@/lib/platform/context";
import { cn, formatPlatformLabel } from "@/lib/utils";

const SWITCH_DELAY_MS = 4000;

export function PlatformSwitcher() {
  const { platforms, platform, setPlatformId, isLoading } = usePlatform();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Platform | null>(null);
  const [switching, setSwitching] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending && !switching) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [pending, switching]);

  async function confirmSwitch() {
    if (!pending || switching) return;
    const next = pending;
    setSwitching(true);
    await new Promise((resolve) => setTimeout(resolve, SWITCH_DELAY_MS));
    setPlatformId(next.id);
    setPending(null);
    setSwitching(false);
    setOpen(false);
  }

  if (isLoading && platforms.length === 0) {
    return (
      <div className="flex h-9 items-center gap-2 rounded-none border border-border bg-white px-3">
        <Spinner size="sm" />
      </div>
    );
  }

  if (platforms.length === 0) {
    return (
      <div className="flex h-9 items-center gap-2 rounded-none border border-amber-200 bg-amber-50 px-3 text-sm text-amber-800">
        <Layers className="size-4" />
        No platforms
      </div>
    );
  }

  const fromLabel = platform
    ? formatPlatformLabel(platform.name)
    : "the current site";
  const toLabel = pending ? formatPlatformLabel(pending.name) : "";

  return (
    <>
      <div className="relative" ref={rootRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Switch platform"
          disabled={switching}
          className={cn(
            "flex h-9 max-w-[11rem] items-center gap-2 rounded-none border border-border bg-white px-2.5 text-sm shadow-sm sm:max-w-[14rem]",
            open && "border-brand-green",
            switching && "opacity-60",
          )}
        >
          <Layers className="size-4 shrink-0 text-brand-green" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-left font-medium text-brand-navy">
            {platform ? formatPlatformLabel(platform.name) : "Platform"}
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180 text-brand-green",
            )}
          />
        </button>

        {open && !pending ? (
          <ul
            role="listbox"
            aria-label="Platforms"
            className="absolute right-0 z-50 mt-1 min-w-full w-max max-w-[18rem] overflow-hidden rounded-none border border-border bg-white py-1 shadow-lg"
          >
            {platforms.map((p) => {
              const selected = p.id === platform?.id;
              return (
                <li key={p.id} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                      selected
                        ? "bg-brand-green font-medium text-white"
                        : "text-brand-navy hover:bg-brand-green/10",
                    )}
                    onClick={() => {
                      if (selected) {
                        setOpen(false);
                        return;
                      }
                      setPending(p);
                      setOpen(false);
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {formatPlatformLabel(p.name)}
                    </span>
                    {selected ? (
                      <Check className="size-4 shrink-0 text-white" aria-hidden />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(pending)}
        title="Switch site?"
        description={`You are about to switch from ${fromLabel} to ${toLabel}. Content and tools will update for the new site.`}
        confirmLabel="Switch site"
        cancelLabel="Stay here"
        busy={switching}
        onCancel={() => {
          if (switching) return;
          setPending(null);
        }}
        onConfirm={() => {
          void confirmSwitch();
        }}
      >
        {switching ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Spinner size="lg" />
            <p className="font-heading text-sm font-bold uppercase tracking-wide text-brand-navy">
              Switching to {toLabel}
            </p>
            <p className="text-sm text-muted-foreground">Please wait a moment…</p>
          </div>
        ) : null}
      </ConfirmDialog>
    </>
  );
}
