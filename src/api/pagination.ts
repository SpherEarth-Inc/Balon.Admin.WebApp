import type { PaginatedResponse } from "@/api/types";

/** Support both paginated envelopes and legacy bare arrays (during API rollout). */
export function normalizePage<T>(
  data: PaginatedResponse<T> | T[],
  pageSize = 20,
): PaginatedResponse<T> {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data,
    };
  }
  return {
    count: typeof data.count === "number" ? data.count : (data.results?.length ?? 0),
    next: data.next ?? null,
    previous: data.previous ?? null,
    results: Array.isArray(data.results) ? data.results : [],
  };
}
