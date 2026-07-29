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
import { useSession } from "@/lib/session/context";

export default function InviteEmployeePage() {
  const router = useRouter();
  const { isSuperAdmin, isLoading: sessionLoading } = useSession();

  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [inviting, setInviting] = useState(false);
  const [lastInvite, setLastInvite] = useState<CreateInviteResponse | null>(
    null,
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

  async function onInvite(e: FormEvent) {
    e.preventDefault();
    if (!isSuperAdmin) return;
    setInviting(true);
    try {
      const invite = await createInvite({
        email: email.trim(),
        role,
      });
      setLastInvite(invite);
      setEmail("");
      if (invite.email_sent) {
        toast.success("Invite emailed");
      } else {
        toast.error(
          invite.email_error ||
            "Invite saved but the email could not be sent. Check Notification.Service.",
        );
      }
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
          Invite a teammate by email. They activate their account only from that email link.
        </p>
      </div>

      <form
        onSubmit={onInvite}
        className="space-y-5 rounded-none border border-border bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
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
              aria-label="Role"
              value={role}
              onChange={setRole}
              options={roleOptions}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={inviting || !role}>
            {inviting ? "Sending…" : "Send invite"}
          </Button>
        </div>
      </form>

      {lastInvite ? (
        <div className="rounded-none border border-border bg-white p-5 text-sm shadow-sm sm:p-6">
          <p className="font-medium text-brand-navy">
            {lastInvite.email_sent ? "Invite sent" : "Invite created"}
          </p>
          <p className="mt-1 text-muted-foreground">
            {lastInvite.email} · {lastInvite.role}
          </p>
          <p className="mt-3 text-muted-foreground">
            {lastInvite.email_sent
              ? "They will receive an email with a one-time link to set their password and sign in. The invite link is not shown here."
              : lastInvite.email_error ||
                "Email was not sent. Fix Notification.Service and send a new invite."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
