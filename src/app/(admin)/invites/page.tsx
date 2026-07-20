"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createInvite } from "@/api/invites";
import type { CreateInviteResponse } from "@/api/types";
import { usePlatform } from "@/lib/platform/context";
import { formatPlatformLabel } from "@/lib/utils";

const ROLES = ["News Editor", "Platform Admin"];

export default function InvitesPage() {
  const { platform } = usePlatform();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [loading, setLoading] = useState(false);
  const [lastInvite, setLastInvite] = useState<CreateInviteResponse | null>(
    null,
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!platform) {
      toast.error("Select a platform first");
      return;
    }

    setLoading(true);
    try {
      const invite = await createInvite({
        email: email.trim(),
        platform: platform.name,
        role,
      });
      setLastInvite(invite);
      setEmail("");
      toast.success("Invite created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-brand-navy">
          Invites
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite a teammate to help with{" "}
          {platform ? formatPlatformLabel(platform.name) : "this site"}.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-none border border-border bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invite-role">Role</Label>
          <Select
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" disabled={loading || !platform}>
          {loading ? "Creating…" : "Create invite"}
        </Button>
      </form>

      {lastInvite ? (
        <div className="rounded-none border border-border bg-white p-5 text-sm shadow-sm">
          <p className="font-medium text-brand-navy">Invite ready</p>
          <p className="mt-1 text-muted-foreground">
            {lastInvite.email} · {lastInvite.role} ·{" "}
            {formatPlatformLabel(lastInvite.platformName)}
          </p>
          <p className="mt-3 break-all rounded-none bg-muted px-3 py-2 text-xs">
            {lastInvite.invite_link}
          </p>
          <Button
            className="mt-3"
            variant="secondary"
            size="sm"
            onClick={async () => {
              await navigator.clipboard.writeText(lastInvite.invite_link);
              toast.success("Invite link copied");
            }}
          >
            Copy invite link
          </Button>
        </div>
      ) : null}
    </div>
  );
}
