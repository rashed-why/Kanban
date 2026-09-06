import type { JWT } from "next-auth/jwt";
import { getAccessTokenExpiry } from "@/lib/jwt-utils";
import { AuthTokensResponse, LoginPayload, LogoutResponse } from "@/types/auth";
import api from "../api";

export const loginAPI = async (payload: LoginPayload) => {
  const { data } = await api.post<AuthTokensResponse>("/auth/login", payload);
  return data;
};

export const refreshAPI = async (refreshToken: string) => {
  const { data } = await api.post<AuthTokensResponse>("/auth/refresh", {
    refreshToken,
  });
  return data;
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
