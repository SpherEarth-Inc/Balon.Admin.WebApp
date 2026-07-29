"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Select } from "@/components/ui/select";
import { PageSpinner, Spinner } from "@/components/ui/spinner";
import {
  deleteFormSubmission,
  getFormSubmission,
  updateFormSubmissionStatus,
} from "@/api/forms";
import type {
  FormFieldRow,
  FormSubmissionDetail,
  FormSubmissionStatus,
} from "@/api/types";
import { useSession } from "@/lib/session/context";
import { formatDate } from "@/lib/utils";

function FieldTable({
  title,
  rows,
}: {
  title: string;
  rows: FormFieldRow[];
}) {
  if (!rows.length) return null;
  return (
    <div className="overflow-hidden rounded-none border border-border bg-white shadow-sm">
      <div className="border-b border-border bg-muted/50 px-4 py-3">
        <h2 className="font-heading text-sm font-bold uppercase tracking-tight text-brand-navy">
          {title}
        </h2>
      </div>
      <dl className="divide-y divide-border">
        {rows.map((row) => (
          <div
            key={row.key}
            className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(10rem,14rem)_1fr] sm:gap-4"
          >
            <dt className="text-sm font-medium text-muted-foreground">
              {row.label}
            </dt>
            <dd className="whitespace-pre-wrap break-words text-sm text-brand-navy">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function statusLabel(status: FormSubmissionStatus) {
  if (status === "new") return "New";
  if (status === "reviewed") return "Reviewed";
  return "Archived";
}

export function FormSubmissionDetailView() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("id");
  const router = useRouter();
  const {
    canAccessForms,
    hasPermission,
    isLoading: sessionLoading,
  } = useSession();
  const canDelete = hasPermission("forms.delete");

  const [item, setItem] = useState<FormSubmissionDetail | null>(null);
  const [status, setStatus] = useState<FormSubmissionStatus>("new");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (sessionLoading) return;
    if (!canAccessForms) {
      router.replace("/dashboard");
    }
  }, [sessionLoading, canAccessForms, router]);

  useEffect(() => {
    if (!canAccessForms) return;
    if (!submissionId) {
      router.replace("/forms/");
      return;
    }
    let cancelled = false;
    setLoading(true);
    getFormSubmission(submissionId)
      .then((data) => {
        if (!cancelled) {
          setItem(data);
          setStatus(data.status);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load submission",
          );
          router.replace("/forms/");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [canAccessForms, submissionId, router]);

  if (sessionLoading || !canAccessForms || loading) {
    return <PageSpinner />;
  }

  if (!item) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Form submissions", href: "/forms" },
              { label: `#${item.id}` },
            ]}
          />
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-brand-navy">
            {item.form_title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {item.summary || item.email || `Submission #${item.id}`}
          </p>
        </div>
        <Link
          href="/forms/"
          className="inline-flex h-10 items-center rounded-none border border-border bg-white px-4 text-sm font-medium text-brand-navy hover:bg-muted"
        >
          Back to list
        </Link>
      </div>

      <div className="rounded-none border border-border bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email
            </div>
            <div className="mt-1 text-sm text-brand-navy">
              {item.email || "—"}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Received
            </div>
            <div className="mt-1 text-sm text-brand-navy">
              {formatDate(item.created_at)}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Current status
            </div>
            <div className="mt-1 text-sm text-brand-navy">
              {statusLabel(item.status)}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Reviewed
            </div>
            <div className="mt-1 text-sm text-brand-navy">
              {item.reviewed_at ? formatDate(item.reviewed_at) : "—"}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-border pt-4">
          <div className="w-44">
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Update status
            </label>
            <Select
              aria-label="Submission status"
              value={status}
              onChange={(next) => setStatus(next as FormSubmissionStatus)}
              options={[
                { value: "new", label: "New" },
                { value: "reviewed", label: "Reviewed" },
                { value: "archived", label: "Archived" },
              ]}
            />
          </div>
          <button
            type="button"
            disabled={saving || status === item.status}
            className="inline-flex h-10 items-center rounded-none bg-brand-green px-4 text-sm font-medium text-white hover:bg-brand-green/90 disabled:opacity-50"
            onClick={async () => {
              setSaving(true);
              try {
                const updated = await updateFormSubmissionStatus(
                  item.id,
                  status,
                );
                setItem(updated);
                setStatus(updated.status);
                toast.success("Status updated");
              } catch (err) {
                toast.error(
                  err instanceof Error ? err.message : "Update failed",
                );
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving…" : "Save status"}
          </button>
          {canDelete ? (
            <button
              type="button"
              disabled={deleting}
              className="inline-flex h-10 items-center rounded-none border border-red-200 bg-white px-4 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              onClick={async () => {
                const label = item.summary || item.email || `#${item.id}`;
                if (!confirm(`Delete submission “${label}”?`)) return;
                setDeleting(true);
                try {
                  await deleteFormSubmission(item.id);
                  toast.success("Deleted");
                  router.replace("/forms/");
                } catch (err) {
                  toast.error(
                    err instanceof Error ? err.message : "Delete failed",
                  );
                  setDeleting(false);
                }
              }}
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          ) : null}
        </div>
      </div>

      <FieldTable title="Answers" rows={item.fields ?? []} />
      <FieldTable title="Meta" rows={item.meta_fields ?? []} />
    </div>
  );
}
