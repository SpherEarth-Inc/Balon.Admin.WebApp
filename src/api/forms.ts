import { apiRequest } from "@/api/client";
import { normalizePage } from "@/api/pagination";
import type {
  FormCategory,
  FormSubmissionDetail,
  FormSubmissionListItem,
  FormSubmissionStatus,
  PageParams,
  PaginatedResponse,
} from "@/api/types";

export function listFormCategories() {
  return apiRequest<FormCategory[]>("/api/forms/categories/");
}

export async function listFormSubmissions(
  params?: PageParams & {
    form_slug?: string;
    status?: FormSubmissionStatus;
    email?: string;
    unreviewed?: boolean;
  },
) {
  const search = new URLSearchParams();
  if (params?.form_slug) search.set("form_slug", params.form_slug);
  if (params?.status) search.set("status", params.status);
  if (params?.email) search.set("email", params.email);
  if (params?.unreviewed) search.set("unreviewed", "true");
  if (params?.page) search.set("page", String(params.page));
  if (params?.page_size) search.set("page_size", String(params.page_size));
  const qs = search.toString();
  const data = await apiRequest<
    PaginatedResponse<FormSubmissionListItem> | FormSubmissionListItem[]
  >(`/api/forms/${qs ? `?${qs}` : ""}`);
  return normalizePage(data, params?.page_size);
}

export function getFormSubmission(id: number | string) {
  return apiRequest<FormSubmissionDetail>(`/api/forms/${id}/`);
}

export function updateFormSubmissionStatus(
  id: number | string,
  status: FormSubmissionStatus,
) {
  return apiRequest<FormSubmissionDetail>(`/api/forms/${id}/`, {
    method: "PATCH",
    body: { status },
  });
}

export function deleteFormSubmission(id: number | string) {
  return apiRequest<void>(`/api/forms/${id}/`, {
    method: "DELETE",
  });
}
