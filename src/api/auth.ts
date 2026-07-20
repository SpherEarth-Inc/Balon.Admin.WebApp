import { apiRequest } from "@/api/client";
import type { TokenPair } from "@/api/types";

export function login(email: string, password: string) {
  return apiRequest<TokenPair>("/api/accounts/auth/token/", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}
