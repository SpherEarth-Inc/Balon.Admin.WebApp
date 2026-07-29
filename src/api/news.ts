import { apiRequest } from "@/api/client";
import type { News, NewsStatus, TipTapDoc } from "@/api/types";

export function listNews(status?: NewsStatus) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  const qs = params.toString();
  return apiRequest<News[]>(`/api/news/${qs ? `?${qs}` : ""}`);
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
