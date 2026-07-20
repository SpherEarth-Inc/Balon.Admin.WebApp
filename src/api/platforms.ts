import { apiRequest } from "@/api/client";
import type { Platform } from "@/api/types";

export function listPlatforms() {
  return apiRequest<Platform[]>("/api/platforms/");
}
