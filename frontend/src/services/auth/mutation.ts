import type { JWT } from "next-auth/jwt";
import { getApiBaseUrl } from "@/lib/api-base-url";
import { getAccessTokenExpiry } from "@/lib/jwt-utils";
import { AuthTokensResponse, LoginPayload, LogoutResponse } from "@/types/auth";
import api from "../api";

async function postAuthJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Auth request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

/** Server-side (NextAuth) — uses runtime API_URL, not build-time axios baseURL. */
export const loginAPI = async (payload: LoginPayload) => {
  return postAuthJson<AuthTokensResponse>("/auth/login", payload);
};

/** Server-side (NextAuth jwt callback) — uses runtime API_URL. */
export const refreshAPI = async (refreshToken: string) => {
  return postAuthJson<AuthTokensResponse>("/auth/refresh", { refreshToken });
};

/** Nest POST /auth/logout — revokes refresh token(s) in DB. Bearer token attached by api.ts. */
export const logoutAPI = async () => {
  const { data } = await api.post<LogoutResponse>("/auth/logout");
  return data;
};

/** Used by NextAuth jwt callback when the access token expires. */
export async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const data = await refreshAPI(token.refreshToken as string);

    return {
      ...token,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      accessTokenExpires: getAccessTokenExpiry(data.accessToken),
      error: undefined,
    };
  } catch {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
