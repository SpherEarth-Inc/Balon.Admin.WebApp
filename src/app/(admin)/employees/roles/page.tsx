"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Shield, Trash2 } from "lucide-react";
import { createRole, deleteRole, listAllPermissions, listRoles, updateRole } from "@/api/staff";
import type { PermissionItem, RoleItem } from "@/api/types";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { PageSpinner } from "@/components/ui/spinner";
import { useSession } from "@/lib/session/context";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

function formatPermission(codename: string) {
  return codename
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" · ");
}

type Draft = {
  id?: number;
  name: string;
  description: string;
  permissions: string[];
  is_system?: boolean;
};

const emptyDraft = (): Draft => ({
  name: "",
  description: "",
  permissions: [],
  is_system: false,
});

export default function RolesPage() {
  const router = useRouter();
  const { isSuperAdmin, isLoading: sessionLoading } = useSession();
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [catalog, setCatalog] = useState<PermissionItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    if (sessionLoading) return;
    if (!isSuperAdmin) {
      router.replace("/employees");
    }
  }, [sessionLoading, isSuperAdmin, router]);

  async function refresh(nextPage = page) {
    const [rolePage, perms] = await Promise.all([
      listRoles({ page: nextPage, page_size: PAGE_SIZE }),
      listAllPermissions(),
    ]);
    setRoles(rolePage.results);
    setTotal(rolePage.count);
    setCatalog(perms);
  }

  useEffect(() => {
    if (!isSuperAdmin) return;
    let cancelled = false;
    setLoading(true);
    refresh(page)
      .catch((err) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to load roles");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh when page/admin changes
  }, [isSuperAdmin, page]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    const name = draft.name.trim();
    if (!name) {
      toast.error("Role name is required");
      return;
    }
    setSaving(true);
    try {
      if (draft.id) {
        await updateRole(draft.id, {
          name: draft.is_system ? undefined : name,
          description: draft.description,
          permissions: draft.permissions,
        });
        toast.success("Role updated");
      } else {
        await createRole({
          name,
          description: draft.description,
          permissions: draft.permissions,
        });
        toast.success("Role created");
      }
      setDraft(null);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save role");
    } finally {
      setSaving(false);
    }
  }

  if (sessionLoading || !isSuperAdmin || loading) {
    return <PageSpinner />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Employees", href: "/employees" },
              { label: "Roles" },
            ]}
          />
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-brand-navy">
            Roles
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create permission bundles to assign to staff.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setDraft(emptyDraft())}
          disabled={Boolean(draft)}
        >
          <Plus className="size-4" />
          New role
        </Button>
      </div>

      {draft ? (
        <form
          onSubmit={onSave}
          className="space-y-5 rounded-none border border-border bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 className="font-heading text-lg font-bold uppercase tracking-tight text-brand-navy">
            {draft.id ? "Edit role" : "Create role"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role-name">Name</Label>
              <Input
                id="role-name"
                value={draft.name}
                disabled={Boolean(draft.is_system)}
                onChange={(e) =>
                  setDraft((prev) =>
                    prev ? { ...prev, name: e.target.value } : prev,
                  )
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-desc">Description</Label>
              <Input
                id="role-desc"
                value={draft.description}
                onChange={(e) =>
                  setDraft((prev) =>
                    prev ? { ...prev, description: e.target.value } : prev,
                  )
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {catalog.map((perm) => {
                const checked = draft.permissions.includes(perm.name);
                return (
                  <label
                    key={perm.name}
                    className={cn(
                      "flex cursor-pointer items-start gap-2 border border-border px-3 py-2 text-sm",
                      checked && "border-brand-green bg-brand-green/5",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 accent-[var(--brand-green)]"
                      checked={checked}
                      onChange={() => {
                        setDraft((prev) => {
                          if (!prev) return prev;
                          const next = checked
                            ? prev.permissions.filter((p) => p !== perm.name)
                            : [...prev.permissions, perm.name];
                          return { ...prev, permissions: next };
                        });
                      }}
                    />
                    <span>
                      <span className="font-medium text-brand-navy">
                        {formatPermission(perm.name)}
                      </span>
                      {perm.description ? (
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {perm.description}
                        </span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDraft(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save role"}
            </Button>
          </div>
        </form>
      ) : null}

      <div className="overflow-hidden rounded-none border border-border bg-white shadow-sm">
        <ul className="divide-y divide-border">
          {roles.map((role) => (
            <li
              key={role.id}
              className="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-brand-navy">{role.name}</p>
                  {role.is_system ? (
                    <span className="border border-border bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      System
                    </span>
                  ) : null}
                </div>
                {role.description ? (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {role.description}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  {(role.permissions ?? []).length
                    ? (role.permissions ?? []).map(formatPermission).join(" · ")
                    : "No permissions"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setDraft({
                      id: role.id,
                      name: role.name,
                      description: role.description ?? "",
                      permissions: [...(role.permissions ?? [])],
                      is_system: role.is_system,
                    })
                  }
                >
                  <Shield className="size-4" />
                  Edit
                </Button>
                {!role.is_system ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      try {
                        await deleteRole(role.id);
                        toast.success("Role deleted");
                        await refresh();
                      } catch (err) {
                        toast.error(
                          err instanceof Error ? err.message : "Could not delete",
                        );
                      }
                    }}
                  >
                    <Trash2 className="size-4 text-red-600" />
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>

        <PaginationBar
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
