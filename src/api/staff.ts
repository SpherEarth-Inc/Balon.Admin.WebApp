import { apiRequest } from "@/api/client";
import { normalizePage } from "@/api/pagination";
import type {
  PageParams,
  PaginatedResponse,
  PermissionItem,
  RoleItem,
  StaffAccessUpdate,
  StaffMember,
} from "@/api/types";

const CATALOG_PAGE_SIZE = 100;

export async function listStaff(params?: PageParams & { q?: string }) {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.page) search.set("page", String(params.page));
  if (params?.page_size) search.set("page_size", String(params.page_size));
  const qs = search.toString();
  const data = await apiRequest<PaginatedResponse<StaffMember> | StaffMember[]>(
    `/api/staff/${qs ? `?${qs}` : ""}`,
  );
  return normalizePage(data, params?.page_size);
}

export function getStaff(id: number) {
  return apiRequest<StaffMember>(`/api/staff/${id}/`);
}

export function updateStaffAccess(id: number, payload: StaffAccessUpdate) {
  return apiRequest<StaffMember>(`/api/staff/${id}/`, {
    method: "PATCH",
    body: payload,
  });
}

export async function listRoles(params?: PageParams) {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.page_size) search.set("page_size", String(params.page_size));
  const qs = search.toString();
  const data = await apiRequest<PaginatedResponse<RoleItem> | RoleItem[]>(
    `/api/roles/${qs ? `?${qs}` : ""}`,
  );
  return normalizePage(data, params?.page_size);
}

/** Full role catalog for pickers (up to max page size). */
export async function listAllRoles() {
  const data = await listRoles({ page: 1, page_size: CATALOG_PAGE_SIZE });
  return data.results;
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

export async function listPermissions(params?: PageParams) {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.page_size) search.set("page_size", String(params.page_size));
  const qs = search.toString();
  const data = await apiRequest<
    PaginatedResponse<PermissionItem> | PermissionItem[]
  >(`/api/permissions/${qs ? `?${qs}` : ""}`);
  return normalizePage(data, params?.page_size);
}

/** Full permission catalog for pickers (up to max page size). */
export async function listAllPermissions() {
  const data = await listPermissions({
    page: 1,
    page_size: CATALOG_PAGE_SIZE,
  });
  return data.results;
}
