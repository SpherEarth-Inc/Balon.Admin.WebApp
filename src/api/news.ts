import { apiRequest } from "@/api/client";
import type { News, NewsStatus, Product, TipTapDoc } from "@/api/types";
import { productApiPrefix } from "@/lib/products";

export function listNews(product: Product, status?: NewsStatus) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  const qs = params.toString();
  const prefix = productApiPrefix(product);
  return apiRequest<News[]>(`/api/${prefix}/news/${qs ? `?${qs}` : ""}`);
}

export function getNews(product: Product, idOrSlug: string | number) {
  return apiRequest<News>(`/api/${productApiPrefix(product)}/news/${idOrSlug}/`);
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

export function createNews(product: Product, payload: NewsWritePayload) {
  return apiRequest<News>(`/api/${productApiPrefix(product)}/news/`, {
    method: "POST",
    body: payload,
  });
}

export function updateNews(
  product: Product,
  idOrSlug: string | number,
  payload: Partial<NewsWritePayload>,
) {
  return apiRequest<News>(
    `/api/${productApiPrefix(product)}/news/${idOrSlug}/`,
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export function deleteNews(product: Product, idOrSlug: string | number) {
  return apiRequest<void>(
    `/api/${productApiPrefix(product)}/news/${idOrSlug}/`,
    {
      method: "DELETE",
    },
  );
}
