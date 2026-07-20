import { apiRequest } from "@/api/client";
import type { RoleItem, StaffMember } from "@/api/types";

export function listStaff(params?: { q?: string; platform?: string }) {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.platform) search.set("platform", params.platform);
  const qs = search.toString();
  return apiRequest<StaffMember[]>(`/api/staff/${qs ? `?${qs}` : ""}`);
}

export function getStaff(id: number) {
  return apiRequest<StaffMember>(`/api/staff/${id}/`);
}

export function listRoles() {
  return apiRequest<RoleItem[]>("/api/roles/");
}
