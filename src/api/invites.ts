import { apiRequest } from "@/api/client";
import type {
  AcceptInviteResponse,
  CreateInviteResponse,
} from "@/api/types";

export function createInvite(payload: {
  email: string;
  role: string;
}) {
  return apiRequest<CreateInviteResponse>("/api/invites/", {
    method: "POST",
    body: payload,
  });
}

export function acceptInvite(payload: {
  token: string;
  password: string;
  first_name?: string;
  last_name?: string;
}) {
  return apiRequest<AcceptInviteResponse>("/api/invites/accept/", {
    method: "POST",
    body: payload,
    auth: false,
  });
}
