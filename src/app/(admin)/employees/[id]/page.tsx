"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getStaff,
  listPermissions,
  listRoles,
  updateStaffAccess,
} from "@/api/staff";
import type { PermissionItem, RoleItem, StaffMember } from "@/api/types";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { PageSpinner } from "@/components/ui/spinner";
import { useSession } from "@/lib/session/context";
import { cn } from "@/lib/utils";

const NO_ROLE = "";

type PermissionGroup = {
  key: string;
  label: string;
  items: PermissionItem[];
};

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

function formatPermission(codename: string) {
  return codename
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" · ");
}

function groupPermissions(catalog: PermissionItem[]): PermissionGroup[] {
  const groups: PermissionGroup[] = [
    { key: "website", label: "Website", items: [] },
    { key: "soccer", label: "Soccer", items: [] },
    { key: "staff", label: "Staff", items: [] },
    { key: "other", label: "Other", items: [] },
  ];
  const byKey = new Map(groups.map((g) => [g.key, g]));

  for (const perm of catalog) {
    if (perm.name.startsWith("website.")) {
      byKey.get("website")!.items.push(perm);
    } else if (perm.name.startsWith("soccer.")) {
      byKey.get("soccer")!.items.push(perm);
    } else if (perm.name.startsWith("staff.")) {
      byKey.get("staff")!.items.push(perm);
    } else {
      byKey.get("other")!.items.push(perm);
    }
  }

  return groups.filter((g) => g.items.length > 0);
}

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { canViewStaff, isSuperAdmin, isLoading: sessionLoading } = useSession();
  const [member, setMember] = useState<StaffMember | null>(null);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [catalog, setCatalog] = useState<PermissionItem[]>([]);
  const [role, setRole] = useState(NO_ROLE);
  const [extras, setExtras] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const roleOptions = useMemo(
    () => [
      { value: NO_ROLE, label: "Custom only (no role)" },
      ...roles.map((r) => ({ value: r.name, label: r.name })),
    ],
    [roles],
  );

  const roleByName = useMemo(() => {
    const map = new Map<string, RoleItem>();
    for (const item of roles) map.set(item.name, item);
    return map;
  }, [roles]);

  const permissionGroups = useMemo(
    () => groupPermissions(catalog),
    [catalog],
  );

  const rolePerms = useMemo(
    () => new Set(roleByName.get(role)?.permissions ?? []),
    [role, roleByName],
  );

  useEffect(() => {
    if (sessionLoading) return;
    if (!canViewStaff) {
      router.replace("/dashboard");
    }
  }, [sessionLoading, canViewStaff, router]);

  useEffect(() => {
    if (!canViewStaff) return;
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      router.replace("/employees");
      return;
    }

    let cancelled = false;
    setLoading(true);
    Promise.all([
      getStaff(id),
      isSuperAdmin
        ? Promise.all([listRoles(), listPermissions()])
        : Promise.resolve([[] as RoleItem[], [] as PermissionItem[]] as const),
    ])
      .then(([data, roleData]) => {
        if (cancelled) return;
        const [roleList, perms] = roleData;
        setMember(data);
        setRole(data.access?.role ?? NO_ROLE);
        setExtras([...(data.access?.extra_permissions ?? [])]);
        setRoles(roleList);
        setCatalog(perms);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Could not load employee");
          router.replace("/employees");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [canViewStaff, isSuperAdmin, params.id, router]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!member || !isSuperAdmin) return;

    if (!role && extras.length === 0) {
      toast.error("Access needs a role or at least one permission");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateStaffAccess(member.id, {
        role: role || null,
        extra_permissions: extras,
      });
      setMember(updated);
      setRole(updated.access?.role ?? NO_ROLE);
      setExtras([...(updated.access?.extra_permissions ?? [])]);
      toast.success("Access updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save access");
    } finally {
      setSaving(false);
    }
  }

  if (sessionLoading || loading || !member) {
    return <PageSpinner />;
  }

  const name = displayName(member);
  const canEditAccess = isSuperAdmin && !member.is_super_admin;
  const effective =
    member.access?.effective_permissions ?? member.access?.permissions ?? [];

  return (
    <div className="space-y-5">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Employees", href: "/employees" },
            { label: name },
          ]}
        />
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-brand-navy">
          {name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{member.email}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[12rem_1fr]">
        <div className="flex justify-center lg:justify-start">
          <div className="flex size-28 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
            {member.profile.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.profile.photo_url}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <span className="font-heading text-2xl font-bold text-brand-green">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-5 rounded-none border border-border bg-white p-5 shadow-sm sm:p-6">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Job title
              </dt>
              <dd className="mt-1 text-sm text-brand-navy">
                {member.profile.job_title || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Phone
              </dt>
              <dd className="mt-1 text-sm text-brand-navy">
                {member.profile.phone_number || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Date of birth
              </dt>
              <dd className="mt-1 text-sm text-brand-navy">
                {member.profile.date_of_birth || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Access
              </dt>
              <dd className="mt-1 text-sm text-brand-navy">
                {member.is_super_admin ? "Super admin" : "Staff"}
              </dd>
            </div>
          </dl>

          <div>
            <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-brand-navy">
              Role & permissions
            </h2>

            {member.is_super_admin ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Super admin access to all products and permissions.
              </p>
            ) : canEditAccess ? (
              <form onSubmit={onSave} className="mt-3 space-y-4">
                <div className="max-w-sm space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Role
                  </p>
                  <Select
                    aria-label="Role"
                    value={role}
                    onChange={(next) => {
                      setRole(next);
                      const nextRolePerms = new Set(
                        roleByName.get(next)?.permissions ?? [],
                      );
                      setExtras((prev) =>
                        prev.filter((p) => !nextRolePerms.has(p)),
                      );
                    }}
                    options={roleOptions}
                  />
                </div>

                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Extra permissions
                  </p>
                  {permissionGroups.map((group) => (
                    <div key={group.key} className="space-y-2">
                      <h3 className="font-heading text-xs font-bold uppercase tracking-wide text-brand-navy">
                        {group.label}
                      </h3>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {group.items.map((perm) => {
                          const fromRole = rolePerms.has(perm.name);
                          const fromExtra = extras.includes(perm.name);
                          const checked = fromRole || fromExtra;
                          return (
                            <label
                              key={perm.name}
                              className={cn(
                                "flex items-start gap-2 border border-border px-3 py-2 text-sm",
                                checked && "border-brand-green bg-brand-green/5",
                                fromRole
                                  ? "cursor-not-allowed opacity-90"
                                  : "cursor-pointer",
                              )}
                            >
                              <input
                                type="checkbox"
                                className="mt-0.5 accent-[var(--brand-green)]"
                                checked={checked}
                                disabled={fromRole}
                                onChange={() => {
                                  if (fromRole) return;
                                  setExtras((prev) =>
                                    fromExtra
                                      ? prev.filter((p) => p !== perm.name)
                                      : [...prev, perm.name],
                                  );
                                }}
                              />
                              <span>
                                <span className="font-medium text-brand-navy">
                                  {formatPermission(perm.name)}
                                </span>
                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                  {fromRole
                                    ? "From role"
                                    : perm.description || "Extra permission"}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving…" : "Save access"}
                  </Button>
                </div>
              </form>
            ) : !member.access ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No staff access configured.
              </p>
            ) : (
              <div className="mt-2 space-y-3 border border-border px-3 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-brand-navy">Role</span>
                  <span className="text-muted-foreground">
                    {member.access.role || "Custom only"}
                  </span>
                </div>
                {effective.length ? (
                  <ul className="flex flex-wrap gap-1.5">
                    {effective.map((perm) => (
                      <li
                        key={perm}
                        className="border border-border bg-muted px-2 py-0.5 text-xs text-brand-navy"
                      >
                        {formatPermission(perm)}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
