import { apiRequest } from "@/api/client";
import { normalizePage } from "@/api/pagination";
import type {
  News,
  NewsStatus,
  PageParams,
  PaginatedResponse,
  TipTapDoc,
} from "@/api/types";

export async function listNews(params?: PageParams & { status?: NewsStatus }) {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.page) search.set("page", String(params.page));
  if (params?.page_size) search.set("page_size", String(params.page_size));
  const qs = search.toString();
  const data = await apiRequest<PaginatedResponse<News> | News[]>(
    `/api/news/${qs ? `?${qs}` : ""}`,
  );
  return normalizePage(data, params?.page_size);
}

export function getNews(idOrSlug: string | number) {
  return apiRequest<News>(`/api/news/${idOrSlug}/`);
}

export type NewsWritePayload = {
  title: string;
  summary?: string;
  featured_image?: string | null;
  content: TipTapDoc;
  category?: number | null;
  status?: NewsStatus;
  slug?: string;
};

export function createNews(payload: NewsWritePayload) {
  return apiRequest<News>(`/api/news/`, {
    method: "POST",
    body: payload,
  });
}

export function updateNews(
  idOrSlug: string | number,
  payload: Partial<NewsWritePayload>,
) {
  return apiRequest<News>(`/api/news/${idOrSlug}/`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteNews(idOrSlug: string | number) {
  return apiRequest<void>(`/api/news/${idOrSlug}/`, {
    method: "DELETE",
  });
}
