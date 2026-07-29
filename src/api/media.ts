import { apiRequest } from "@/api/client";
import type { MediaItem } from "@/api/types";

export function listMedia() {
  return apiRequest<MediaItem[]>(`/api/media/`);
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
