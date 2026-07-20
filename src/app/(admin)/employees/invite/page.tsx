"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createInvite } from "@/api/invites";
import { listRoles } from "@/api/staff";
import type { CreateInviteResponse, RoleItem } from "@/api/types";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PageSpinner } from "@/components/ui/spinner";
import { usePlatform } from "@/lib/platform/context";
import { useSession } from "@/lib/session/context";
import { formatPlatformLabel } from "@/lib/utils";

export default function InviteEmployeePage() {
  const router = useRouter();
  const { platforms } = usePlatform();
  const { isSuperAdmin, isLoading: sessionLoading } = useSession();

  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [email, setEmail] = useState("");
  const [platformName, setPlatformName] = useState("");
  const [role, setRole] = useState("");
  const [inviting, setInviting] = useState(false);
  const [lastInvite, setLastInvite] = useState<CreateInviteResponse | null>(
    null,
  );

  const platformOptions = useMemo(
    () =>
      platforms.map((p) => ({
        value: p.name,
        label: formatPlatformLabel(p.name),
      })),
    [platforms],
  );

  const roleOptions = useMemo(
    () => roles.map((r) => ({ value: r.name, label: r.name })),
    [roles],
  );

  useEffect(() => {
    if (sessionLoading) return;
    if (!isSuperAdmin) {
      router.replace("/employees");
    }
  }, [sessionLoading, isSuperAdmin, router]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    listRoles()
      .then((data) => {
        setRoles(data);
        setRole((current) => current || data[0]?.name || "");
      })
      .catch(() => setRoles([]));
  }, [isSuperAdmin]);

  useEffect(() => {
    if (platformOptions[0] && !platformName) {
      setPlatformName(platformOptions[0].value);
    }
  }, [platformOptions, platformName]);

  async function onInvite(e: FormEvent) {
    e.preventDefault();
    if (!isSuperAdmin) return;
    setInviting(true);
    try {
      const invite = await createInvite({
        email: email.trim(),
        platform: platformName,
        role,
      });
      setLastInvite(invite);
      setEmail("");
      toast.success("Invite created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setInviting(false);
    }
  }

  if (sessionLoading || !isSuperAdmin) {
    return <PageSpinner />;
  }

  return (
    <div className="space-y-5">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Employees", href: "/employees" },
            { label: "Invite" },
          ]}
        />
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-brand-navy">
          Invite
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite a teammate and choose their site and role.
        </p>
      </div>

      <form
        onSubmit={onInvite}
        className="space-y-5 rounded-none border border-border bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="grid gap-4 md:grid-cols-3">
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
            <Label htmlFor="invite-platform">Platform</Label>
            <Select
              id="invite-platform"
              aria-label="Platform"
              value={platformName}
              onChange={setPlatformName}
              options={platformOptions}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select
              id="invite-role"
              aria-label="Role"
              value={role}
              onChange={setRole}
              options={roleOptions}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={inviting || !platformName || !role}>
            {inviting ? "Creating…" : "Create invite"}
          </Button>
        </div>
      </form>

      {lastInvite ? (
        <div className="rounded-none border border-border bg-white p-5 text-sm shadow-sm sm:p-6">
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
            type="button"
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
