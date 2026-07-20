"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { getMe } from "@/api/account";
import { useAuth } from "@/lib/auth/context";

function displayLabel(first: string, last: string, email: string | null) {
  const name = [first, last].filter(Boolean).join(" ").trim();
  return name || email || "Account";
}

export function ProfileMenu() {
  const { email, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(email ?? "Account");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    getMe()
      .then((me) => {
        if (cancelled) return;
        setLabel(
          displayLabel(
            me.profile.first_name,
            me.profile.last_name,
            me.email,
          ),
        );
        setPhotoUrl(me.profile.photo_url);
      })
      .catch(() => {
        if (!cancelled) setLabel(email ?? "Account");
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, email]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex size-9 items-center justify-center overflow-hidden rounded-full border border-border bg-white text-brand-navy shadow-sm hover:bg-muted"
        aria-label="Account menu"
        aria-expanded={open}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="" className="size-full object-cover" />
        ) : (
          <UserRound className="size-4" />
        )}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-none border border-border bg-white shadow-lg">
          <div className="border-b border-border px-3 py-2.5">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="truncate text-sm font-medium text-brand-navy">
              {label}
            </p>
            {email && label !== email ? (
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            ) : null}
          </div>
          <Link
            href="/profile"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-brand-navy hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            <UserRound className="size-4" />
            Profile
          </Link>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-brand-navy hover:bg-muted"
            onClick={() => {
              logout();
              setOpen(false);
              router.replace("/login");
            }}
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
