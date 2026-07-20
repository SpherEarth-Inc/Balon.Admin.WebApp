import { apiRequest } from "@/api/client";
import type { News, NewsStatus, TipTapDoc } from "@/api/types";

export function listNews(platform: string, status?: NewsStatus) {
  const params = new URLSearchParams({ platform });
  if (status) params.set("status", status);
  return apiRequest<News[]>(`/api/news/?${params.toString()}`);
}

export function getNews(idOrSlug: string | number, platform?: string) {
  const params = platform
    ? `?${new URLSearchParams({ platform }).toString()}`
    : "";
  return apiRequest<News>(`/api/news/${idOrSlug}/${params}`);
}

export type NewsWritePayload = {
  platform: string;
  title: string;
  summary?: string;
  featured_image?: string | null;
  content: TipTapDoc;
  category?: number | null;
  status?: NewsStatus;
  slug?: string;
};

export function createNews(payload: NewsWritePayload) {
  return apiRequest<News>("/api/news/", {
    method: "POST",
    body: payload,
  });
}

export function updateNews(
  idOrSlug: string | number,
  payload: Partial<Omit<NewsWritePayload, "platform">>,
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
