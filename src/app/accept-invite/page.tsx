"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { acceptInvite } from "@/api/invites";
import { ApiError } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
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
        token: token.trim(),
        password,
      });
      toast.success(result.message);
      router.replace("/login");
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

  return (
    <div className="w-full max-w-md rounded-none border border-border bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="font-heading text-sm font-bold uppercase tracking-wide text-brand-green">
          Staff invite
        </p>
        <h1 className="mt-1 font-heading text-3xl font-bold uppercase tracking-tight text-brand-navy">
          Accept your invite
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Set a password to activate your staff account.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="token">Invite token</Label>
          <Input
            id="token"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
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
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Accepting…" : "Accept invite"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already activated?{" "}
        <Link href="/login" className="font-medium text-brand-green hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Suspense
        fallback={<Spinner size="lg" />}
      >
        <AcceptInviteForm />
      </Suspense>
    </div>
  );
}
