import { apiRequest } from "@/api/client";
import type { MediaItem } from "@/api/types";

export function listMedia(platform: string) {
  const params = new URLSearchParams({ platform });
  return apiRequest<MediaItem[]>(`/api/media/?${params.toString()}`);
}

export function uploadMedia(platform: string, file: File, newsId: number) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("platform", platform);
  formData.append("news", String(newsId));
  return apiRequest<MediaItem>("/api/media/upload/", {
    method: "POST",
    formData,
  });
}
