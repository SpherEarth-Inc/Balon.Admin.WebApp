"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { Select } from "@/components/ui/select";
import { PageSpinner, Spinner } from "@/components/ui/spinner";
import {
  deleteFormSubmission,
  listFormCategories,
  listFormSubmissions,
} from "@/api/forms";
import type {
  FormCategory,
  FormSubmissionListItem,
  FormSubmissionStatus,
} from "@/api/types";
import { useSession } from "@/lib/session/context";
import { cn, formatDate } from "@/lib/utils";

const PAGE_SIZE = 20;

function statusLabel(status: FormSubmissionStatus) {
  if (status === "new") return "New";
  if (status === "reviewed") return "Reviewed";
  return "Archived";
}

export function FormsList() {
  const router = useRouter();
  const {
    canAccessForms,
    hasPermission,
    isLoading: sessionLoading,
  } = useSession();
  const canDelete = hasPermission("forms.delete");

  const [categories, setCategories] = useState<FormCategory[]>([]);
  const [formSlug, setFormSlug] = useState("");
  const [status, setStatus] = useState<FormSubmissionStatus | "">("");
  const [items, setItems] = useState<FormSubmissionListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;
    if (!canAccessForms) {
      router.replace("/dashboard");
    }
  }, [sessionLoading, canAccessForms, router]);

  useEffect(() => {
    if (!canAccessForms) return;
    let cancelled = false;
    setCategoriesLoading(true);
    listFormCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load categories",
          );
          setCategories([]);
        }
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [canAccessForms]);

  useEffect(() => {
    setPage(1);
  }, [formSlug, status]);

  useEffect(() => {
    if (!canAccessForms) return;
    let cancelled = false;
    setLoading(true);
    listFormSubmissions({
      form_slug: formSlug || undefined,
      status: status || undefined,
      page,
      page_size: PAGE_SIZE,
    })
      .then((data) => {
        if (!cancelled) {
          setItems(data.results);
          setTotal(data.count);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load submissions",
          );
          setItems([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [canAccessForms, formSlug, status, page]);

  async function refreshCategories() {
    try {
      const data = await listFormCategories();
      setCategories(data);
    } catch {
      /* ignore */
    }
  }

  if (sessionLoading || !canAccessForms) {
    return <PageSpinner />;
  }

  const allCount = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="space-y-5">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Form submissions" },
          ]}
        />
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-brand-navy">
          Form submissions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review website form responses by category.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFormSlug("")}
          className={cn(
            "inline-flex h-9 items-center rounded-none border px-3 text-sm font-medium transition-colors",
            formSlug === ""
              ? "border-brand-green bg-brand-green text-white"
              : "border-border bg-white text-brand-navy hover:border-brand-green/40",
          )}
        >
          All
          {!categoriesLoading ? (
            <span className="ml-2 opacity-80">({allCount})</span>
          ) : null}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => setFormSlug(cat.slug)}
            className={cn(
              "inline-flex h-9 items-center rounded-none border px-3 text-sm font-medium transition-colors",
              formSlug === cat.slug
                ? "border-brand-green bg-brand-green text-white"
                : "border-border bg-white text-brand-navy hover:border-brand-green/40",
            )}
          >
            {cat.title}
            <span className="ml-2 opacity-80">({cat.count})</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Select
          className="w-44"
          aria-label="Status filter"
          value={status}
          onChange={(next) => setStatus(next as FormSubmissionStatus | "")}
          options={[
            { value: "", label: "All statuses" },
            { value: "new", label: "New" },
            { value: "reviewed", label: "Reviewed" },
            { value: "archived", label: "Archived" },
          ]}
        />
      </div>

      <div className="overflow-hidden rounded-none border border-border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Submission</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                Form
              </th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">
                Received
              </th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8">
                  <div className="flex justify-center">
                    <Spinner />
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No submissions found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-brand-navy">
                      {item.summary || item.email || `Submission #${item.id}`}
                    </div>
                    {item.email && item.summary ? (
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {item.email}
                      </div>
                    ) : null}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {item.form_title}
                  </td>
                  <td className="px-4 py-3">{statusLabel(item.status)}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/forms/view/?id=${item.id}`}
                        className="text-sm font-medium text-brand-green hover:underline"
                      >
                        View
                      </Link>
                      {canDelete ? (
                        <button
                          type="button"
                          className="text-sm font-medium text-red-600 hover:underline"
                          onClick={async () => {
                            const label =
                              item.summary || item.email || `#${item.id}`;
                            if (!confirm(`Delete submission “${label}”?`)) {
                              return;
                            }
                            try {
                              await deleteFormSubmission(item.id);
                              const data = await listFormSubmissions({
                                form_slug: formSlug || undefined,
                                status: status || undefined,
                                page,
                                page_size: PAGE_SIZE,
                              });
                              setItems(data.results);
                              setTotal(data.count);
                              if (data.results.length === 0 && page > 1) {
                                setPage(page - 1);
                              }
                              void refreshCategories();
                              toast.success("Deleted");
                            } catch (err) {
                              toast.error(
                                err instanceof Error
                                  ? err.message
                                  : "Delete failed",
                              );
                            }
                          }}
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginationBar
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}
