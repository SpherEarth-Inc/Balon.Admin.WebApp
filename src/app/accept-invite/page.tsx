"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { acceptInvite } from "@/api/invites";
import { ApiError } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth/context";

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { establishSession } = useAuth();
  const token = useMemo(
    () => (searchParams.get("token") || "").trim(),
    [searchParams],
  );

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      toast.error("This invite link is missing a token. Use the link from your email.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const result = await acceptInvite({
        token,
        password,
      });
      establishSession(result.access, result.refresh, result.email);
      toast.success("Welcome — your account is ready.");
      router.replace("/dashboard/");
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not accept invite",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="w-full max-w-md rounded-none border border-border bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-heading text-2xl font-bold uppercase tracking-tight text-brand-navy">
          Invite required
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Staff accounts are activated only from the secure link emailed to you.
          Open that email and use the invitation link — this page cannot be used
          without it.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-none border border-border bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="font-heading text-sm font-bold uppercase tracking-wide text-brand-green">
          Staff invite
        </p>
        <h1 className="mt-1 font-heading text-3xl font-bold uppercase tracking-tight text-brand-navy">
          Set your password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a password to activate your Staff Buddy account. You will be signed in
          automatically when it succeeds.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Activating…" : "Activate account"}
        </Button>
      </form>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Suspense fallback={<Spinner size="lg" />}>
        <AcceptInviteForm />
      </Suspense>
    </div>
  );
}
