import { apiRequest } from "@/api/client";
import type { MeResponse, ProfileUpdatePayload } from "@/api/types";

export function getMe() {
  return apiRequest<MeResponse>("/api/accounts/me/");
}

export function updateMe(payload: ProfileUpdatePayload) {
  return apiRequest<MeResponse>("/api/accounts/me/", {
    method: "PATCH",
    body: payload,
  });
}

export function uploadProfilePhoto(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest<MeResponse>("/api/accounts/me/photo/", {
    method: "POST",
    formData,
  });
}

export function removeProfilePhoto() {
  return apiRequest<MeResponse>("/api/accounts/me/photo/", {
    method: "DELETE",
  });
}
