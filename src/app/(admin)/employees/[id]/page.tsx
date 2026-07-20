"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getStaff } from "@/api/staff";
import type { StaffMember } from "@/api/types";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageSpinner } from "@/components/ui/spinner";
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

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { canViewStaff, isLoading: sessionLoading } = useSession();
  const [member, setMember] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);

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
    getStaff(id)
      .then((data) => {
        if (!cancelled) setMember(data);
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
  }, [canViewStaff, params.id, router]);

  if (sessionLoading || loading || !member) {
    return <PageSpinner />;
  }

  const name = displayName(member);

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
              Sites & roles
            </h2>
            {member.memberships.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {member.is_super_admin
                  ? "Super admin access to all sites."
                  : "No platform memberships."}
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-border border border-border">
                {member.memberships.map((m) => (
                  <li
                    key={`${m.platformId}-${m.role}`}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-brand-navy">
                      {formatPlatformLabel(m.platformName)}
                    </span>
                    <span className="text-muted-foreground">{m.role}</span>
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
