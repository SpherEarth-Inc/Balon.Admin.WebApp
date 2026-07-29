"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Shield, UserPlus } from "lucide-react";
import { listStaff } from "@/api/staff";
import type { StaffMember } from "@/api/types";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageSpinner, Spinner } from "@/components/ui/spinner";
import { useSession } from "@/lib/session/context";

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

function roleLabel(member: StaffMember) {
  if (member.is_super_admin) return "Super admin";
  if (!member.access) return "—";
  return member.access.role || "Custom";
}

export default function EmployeesPage() {
  const router = useRouter();
  const { canViewStaff, isSuperAdmin, isLoading: sessionLoading } = useSession();

  const [q, setQ] = useState("");
  const [items, setItems] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (sessionLoading || !canViewStaff) {
    return <PageSpinner />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
          <div className="flex flex-wrap gap-2">
            <Link
              href="/employees/roles"
              className="inline-flex h-10 items-center gap-2 rounded-none border border-border bg-white px-4 text-sm font-medium text-brand-navy hover:bg-muted"
            >
              <Shield className="size-4 text-brand-green" />
              Roles
            </Link>
            <Link
              href="/employees/invite"
              className="inline-flex h-10 items-center gap-2 rounded-none bg-brand-green px-4 text-sm font-medium text-white hover:bg-brand-green/90"
            >
              <UserPlus className="size-4" />
              Invite
            </Link>
          </div>
        ) : null}
      </div>

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
                <th className="px-4 py-3 font-medium">Staff</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  Job title
                </th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">
                  Role
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
                items.map((member) => {
                  const name = displayName(member);
                  return (
                    <tr
                      key={member.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/employees/${member.id}`}
                          className="flex items-center gap-3 font-medium text-brand-green hover:underline"
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                            {member.profile.photo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={member.profile.photo_url}
                                alt=""
                                className="size-full object-cover"
                              />
                            ) : (
                              <span className="font-heading text-sm font-bold text-brand-navy">
                                {name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </span>
                          <span className="min-w-0 truncate">{name}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {member.email}
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                        {member.profile.job_title || "—"}
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                        {roleLabel(member)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
