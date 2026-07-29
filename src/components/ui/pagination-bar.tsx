"use client";

type PaginationBarProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function PaginationBar({
  page,
  pageSize,
  total,
  onPageChange,
  className,
}: PaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1 && total === 0) return null;

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground ${className ?? ""}`}
    >
      <p>
        {total === 0
          ? "No results"
          : `Showing ${from}–${to} of ${total}`}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-none border border-border bg-white px-3 py-1.5 font-medium text-brand-navy disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <span className="tabular-nums">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          className="rounded-none border border-border bg-white px-3 py-1.5 font-medium text-brand-navy disabled:opacity-40"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
