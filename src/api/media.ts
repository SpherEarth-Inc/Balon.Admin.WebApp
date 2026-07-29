import { apiRequest } from "@/api/client";
import type { MediaItem, Product } from "@/api/types";
import { productApiPrefix } from "@/lib/products";

export function listMedia(product: Product) {
  return apiRequest<MediaItem[]>(
    `/api/${productApiPrefix(product)}/media/`,
  );
}

export function uploadMedia(product: Product, file: File, newsId: number) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("news", String(newsId));
  return apiRequest<MediaItem>(
    `/api/${productApiPrefix(product)}/media/upload/`,
    {
      method: "POST",
      formData,
    },
  );
}
