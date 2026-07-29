import { apiRequest } from "@/api/client";
import { normalizePage } from "@/api/pagination";
import type { MediaItem, PageParams, PaginatedResponse } from "@/api/types";

export async function listMedia(params?: PageParams) {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.page_size) search.set("page_size", String(params.page_size));
  const qs = search.toString();
  const data = await apiRequest<PaginatedResponse<MediaItem> | MediaItem[]>(
    `/api/media/${qs ? `?${qs}` : ""}`,
  );
  return normalizePage(data, params?.page_size);
}

export function uploadMedia(file: File, newsId: number) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("news", String(newsId));
  return apiRequest<MediaItem>(`/api/media/upload/`, {
    method: "POST",
    formData,
  });
}
