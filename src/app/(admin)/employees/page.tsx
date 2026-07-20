"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createInvite } from "@/api/invites";
import { listRoles, listStaff } from "@/api/staff";
import type { CreateInviteResponse, RoleItem, StaffMember } from "@/api/types";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PageSpinner, Spinner } from "@/components/ui/spinner";
import { usePlatform } from "@/lib/platform/context";
import { useSession } from "@/lib/session/context";
import { formatPlatformLabel } from "@/lib/utils";

function displayName(member: StaffMember) {
  const name = [
    member.profile.first_name,
    member.profile.middle_name,
    member.profile.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || member.email;
}

export default function EmployeesPage() {
  const router = useRouter();
  const { platforms } = usePlatform();
  const { canViewStaff, isSuperAdmin, isLoading: sessionLoading } = useSession();

  const [q, setQ] = useState("");
  const [items, setItems] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<RoleItem[]>([]);

  const [email, setEmail] = useState("");
  const [platformName, setPlatformName] = useState("");
  const [role, setRole] = useState("");
  const [inviting, setInviting] = useState(false);
  const [lastInvite, setLastInvite] = useState<CreateInviteResponse | null>(null);

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
    if (!canViewStaff) {
      router.replace("/dashboard");
    }
  }, [sessionLoading, canViewStaff, router]);

  useEffect(() => {
    if (!canViewStaff) return;
    let cancelled = false;
    setLoading(true);
    listStaff({ q: q.trim() || undefined })
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to load staff");
          setItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [canViewStaff, q]);

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
      const refreshed = await listStaff({ q: q.trim() || undefined });
      setItems(refreshed);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setInviting(false);
    }
  }

  if (sessionLoading || !canViewStaff) {
    return <PageSpinner />;
  }

  return (
    <div className="space-y-5">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Employees" },
          ]}
        />
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-brand-navy">
          Employees
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find and view staff members.
        </p>
      </div>

      {isSuperAdmin ? (
        <form
          onSubmit={onInvite}
          className="space-y-5 rounded-none border border-border bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 className="font-heading text-lg font-bold uppercase tracking-tight text-brand-navy">
            Invite staff
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-1">
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
          {lastInvite ? (
            <div className="border-t border-border pt-4 text-sm">
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
        </form>
      ) : null}

      <div className="space-y-3">
        <div className="max-w-md">
          <Label htmlFor="staff-search" className="sr-only">
            Search
          </Label>
          <Input
            id="staff-search"
            placeholder="Search by name, email, or job title…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="overflow-hidden rounded-none border border-border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  Job title
                </th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">
                  Sites
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8">
                    <div className="flex justify-center">
                      <Spinner />
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No staff found.
                  </td>
                </tr>
              ) : (
                items.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/employees/${member.id}`}
                        className="font-medium text-brand-green hover:underline"
                      >
                        {displayName(member)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {member.email}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {member.profile.job_title || "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {member.memberships.length
                        ? member.memberships
                            .map(
                              (m) =>
                                `${formatPlatformLabel(m.platformName)} (${m.role})`,
                            )
                            .join(", ")
                        : member.is_super_admin
                          ? "Super admin"
                          : "—"}
                    </td>
                  </tr>
                ))}
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
