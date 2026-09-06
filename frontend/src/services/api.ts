import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { signOut } from "next-auth/react";
import {
  clearAuthCache,
  refreshAuthSession,
  resolveAuthSession,
} from "./auth-session-cache";

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://localhost:4000";

let refreshPromise: Promise<string | null> | null = null;

const api = axios.create({
  baseURL: `${apiBaseUrl}/`,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams();

    for (const key in params) {
      const value = params[key];

      if (Array.isArray(value)) {
        value.forEach((val) => searchParams.append(key, val));
      } else if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    }

    return searchParams.toString();
  },
});

api.interceptors.request.use(async (config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const { accessToken, error } = await resolveAuthSession();

  if (error === "RefreshAccessTokenError") {
    clearAuthCache();
    await signOut({ callbackUrl: "/auth/login" });
    return Promise.reject(new Error("Session expired"));
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;

    const url = originalRequest?.url ?? "";

    if (
      typeof window === "undefined" ||
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = refreshAuthSession().then(({ accessToken, error: sessionError }) => {
        refreshPromise = null;

        if (sessionError === "RefreshAccessTokenError") {
          return null;
        }

        return accessToken;
      });
    }

    const accessToken = await refreshPromise;

    if (!accessToken) {
      clearAuthCache();
      await signOut({ callbackUrl: "/auth/login" });
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    return api(originalRequest);
  },
);

export default api;
