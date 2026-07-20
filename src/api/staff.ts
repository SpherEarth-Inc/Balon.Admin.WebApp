import { apiRequest } from "@/api/client";
import type {
  PermissionItem,
  RoleItem,
  StaffMember,
  StaffMembershipUpdate,
} from "@/api/types";

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

export function updateStaffMemberships(
  id: number,
  memberships: StaffMembershipUpdate[],
) {
  return apiRequest<StaffMember>(`/api/staff/${id}/`, {
    method: "PATCH",
    body: { memberships },
  });
}

export function listRoles() {
  return apiRequest<RoleItem[]>("/api/roles/");
}

export function getRole(id: number) {
  return apiRequest<RoleItem>(`/api/roles/${id}/`);
}

export function createRole(payload: {
  name: string;
  description?: string;
  permissions: string[];
}) {
  return apiRequest<RoleItem>("/api/roles/", {
    method: "POST",
    body: payload,
  });
}

export function updateRole(
  id: number,
  payload: {
    name?: string;
    description?: string;
    permissions?: string[];
  },
) {
  return apiRequest<RoleItem>(`/api/roles/${id}/`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteRole(id: number) {
  return apiRequest<void>(`/api/roles/${id}/`, {
    method: "DELETE",
  });
}

export function listPermissions() {
  return apiRequest<PermissionItem[]>("/api/permissions/");
}
