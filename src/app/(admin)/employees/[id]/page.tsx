"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  getStaff,
  listPermissions,
  listRoles,
  updateStaffMemberships,
} from "@/api/staff";
import type { PermissionItem, RoleItem, StaffMember } from "@/api/types";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { PageSpinner } from "@/components/ui/spinner";
import { usePlatform } from "@/lib/platform/context";
import { useSession } from "@/lib/session/context";
import { cn, formatPlatformLabel } from "@/lib/utils";

type DraftMembership = {
  key: string;
  platform: string;
  role: string;
  extras: string[];
};

const NO_ROLE = "";

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

function toDrafts(member: StaffMember): DraftMembership[] {
  return member.memberships.map((m, index) => ({
    key: `${m.platformId}-${index}`,
    platform: m.platformName,
    role: m.role ?? NO_ROLE,
    extras: [...(m.extra_permissions ?? [])],
  }));
}

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { platforms } = usePlatform();
  const { canViewStaff, isSuperAdmin, isLoading: sessionLoading } = useSession();
  const [member, setMember] = useState<StaffMember | null>(null);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [catalog, setCatalog] = useState<PermissionItem[]>([]);
  const [drafts, setDrafts] = useState<DraftMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const platformOptions = useMemo(
    () =>
      platforms.map((p) => ({
        value: p.name,
        label: formatPlatformLabel(p.name),
      })),
    [platforms],
  );

  const roleOptions = useMemo(
    () => [
      { value: NO_ROLE, label: "Custom only (no role)" },
      ...roles.map((r) => ({ value: r.name, label: r.name })),
    ],
    [roles],
  );

  const roleByName = useMemo(() => {
    const map = new Map<string, RoleItem>();
    for (const role of roles) map.set(role.name, role);
    return map;
  }, [roles]);

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
        setDrafts(toDrafts(data));
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

    const platformsSeen = new Set<string>();
    for (const row of drafts) {
      if (!row.platform) {
        toast.error("Each site needs a platform");
        return;
      }
      if (platformsSeen.has(row.platform)) {
        toast.error("Each platform can only appear once");
        return;
      }
      platformsSeen.add(row.platform);
      if (!row.role && row.extras.length === 0) {
        toast.error(
          `${formatPlatformLabel(row.platform)} needs a role or at least one permission`,
        );
        return;
      }
    }

    setSaving(true);
    try {
      const updated = await updateStaffMemberships(
        member.id,
        drafts.map((row) => ({
          platform: row.platform,
          role: row.role || null,
          extra_permissions: row.extras,
        })),
      );
      setMember(updated);
      setDrafts(toDrafts(updated));
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
              Sites, roles & permissions
            </h2>

            {member.is_super_admin ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Super admin access to all sites and permissions.
              </p>
            ) : canEditAccess ? (
              <form onSubmit={onSave} className="mt-3 space-y-4">
                {drafts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No platform memberships yet. Add a site below.
                  </p>
                ) : null}

                {drafts.map((row, index) => {
                  const rolePerms = new Set(
                    roleByName.get(row.role)?.permissions ?? [],
                  );
                  return (
                    <div
                      key={row.key}
                      className="space-y-3 border border-border p-3"
                    >
                      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                        <Select
                          aria-label={`Platform ${index + 1}`}
                          value={row.platform}
                          onChange={(next) => {
                            setDrafts((prev) =>
                              prev.map((item) =>
                                item.key === row.key
                                  ? { ...item, platform: next }
                                  : item,
                              ),
                            );
                          }}
                          options={platformOptions}
                        />
                        <Select
                          aria-label={`Role ${index + 1}`}
                          value={row.role}
                          onChange={(next) => {
                            setDrafts((prev) =>
                              prev.map((item) =>
                                item.key === row.key
                                  ? {
                                      ...item,
                                      role: next,
                                      extras: item.extras.filter(
                                        (p) =>
                                          !(
                                            roleByName.get(next)?.permissions ??
                                            []
                                          ).includes(p),
                                      ),
                                    }
                                  : item,
                              ),
                            );
                          }}
                          options={roleOptions}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label="Remove site"
                          onClick={() => {
                            setDrafts((prev) =>
                              prev.filter((item) => item.key !== row.key),
                            );
                          }}
                        >
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Permissions
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {catalog.map((perm) => {
                            const fromRole = rolePerms.has(perm.name);
                            const fromExtra = row.extras.includes(perm.name);
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
                                    setDrafts((prev) =>
                                      prev.map((item) => {
                                        if (item.key !== row.key) return item;
                                        const extras = fromExtra
                                          ? item.extras.filter(
                                              (p) => p !== perm.name,
                                            )
                                          : [...item.extras, perm.name];
                                        return { ...item, extras };
                                      }),
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
                    </div>
                  );
                })}

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={!platformOptions.length}
                    onClick={() => {
                      const unused = platformOptions.find(
                        (p) => !drafts.some((d) => d.platform === p.value),
                      );
                      setDrafts((prev) => [
                        ...prev,
                        {
                          key: `new-${Date.now()}`,
                          platform:
                            unused?.value ?? platformOptions[0]?.value ?? "",
                          role: roles[0]?.name ?? NO_ROLE,
                          extras: [],
                        },
                      ]);
                    }}
                  >
                    <Plus className="size-4" />
                    Add site
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving…" : "Save access"}
                  </Button>
                </div>
              </form>
            ) : member.memberships.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No platform memberships.
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-border border border-border">
                {member.memberships.map((m) => (
                  <li
                    key={`${m.platformId}-${m.role ?? "custom"}`}
                    className="space-y-2 px-3 py-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-brand-navy">
                        {formatPlatformLabel(m.platformName)}
                      </span>
                      <span className="text-muted-foreground">
                        {m.role || "Custom only"}
                      </span>
                    </div>
                    {(m.effective_permissions ?? m.permissions ?? []).length ? (
                      <ul className="flex flex-wrap gap-1.5">
                        {(m.effective_permissions ?? m.permissions ?? []).map(
                          (perm) => (
                            <li
                              key={perm}
                              className="border border-border bg-muted px-2 py-0.5 text-xs text-brand-navy"
                            >
                              {formatPermission(perm)}
                            </li>
                          ),
                        )}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
