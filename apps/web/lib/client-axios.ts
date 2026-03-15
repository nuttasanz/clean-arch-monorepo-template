"use client";

import axios, { type AxiosRequestConfig } from "axios";

/**
 * Pending requests waiting for a token refresh to complete.
 */
interface PendingRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: PendingRequest[] = [];

/**
 * Resolves or rejects all queued requests after a refresh attempt.
 */
function processQueue(error: unknown, token: string | null): void {
  for (const pending of failedQueue) {
    if (error !== null) {
      pending.reject(error);
    } else {
      pending.resolve(token!);
    }
  }
  failedQueue = [];
}

/**
 * Client-side Axios instance for browser → Next.js BFF route handlers.
 *
 * Request interceptor:  attaches Authorization: Bearer <accessToken> from Zustand.
 * Response interceptor: on 401, triggers a single silent refresh via /api/auth/refresh
 *                       and queues all concurrent 401 responses behind that one
 *                       in-flight promise (prevents token rotation race conditions).
 */
const clientAxios = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request: attach access token ────────────────────────────────────────────
clientAxios.interceptors.request.use(async (config) => {
  const { useAuthStore } = await import(
    "@/features/auth/stores/auth.store"
  );
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response: in-flight queue on 401 ────────────────────────────────────────
clientAxios.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    type RetryableConfig = AxiosRequestConfig & { _retry?: boolean };
    const originalRequest = (error as { config?: RetryableConfig }).config;

    // Only intercept 401s from our own BFF, and only on the first attempt.
    if (
      !axios.isAxiosError(error) ||
      error.response?.status !== 401 ||
      originalRequest?._retry
    ) {
      return Promise.reject(error);
    }

    // Another refresh is already in-flight — queue this request.
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest!.headers = {
          ...originalRequest!.headers,
          Authorization: `Bearer ${token}`,
        };
        return clientAxios(originalRequest!);
      });
    }

    originalRequest!._retry = true;
    isRefreshing = true;

    try {
      // Use a plain axios call (not clientAxios) to avoid interceptor recursion.
      const { data } = await axios.post<{ data: { accessToken: string } }>(
        "/api/v1/auth/refresh",
      );
      const newToken = data.data.accessToken;

      const { useAuthStore } = await import(
        "@/features/auth/stores/auth.store"
      );
      useAuthStore.getState().setAccessToken(newToken);

      processQueue(null, newToken);

      originalRequest!.headers = {
        ...originalRequest!.headers,
        Authorization: `Bearer ${newToken}`,
      };
      return clientAxios(originalRequest!);
    } catch (refreshError) {
      processQueue(refreshError, null);

      const { useAuthStore } = await import(
        "@/features/auth/stores/auth.store"
      );
      useAuthStore.getState().clearUser();
      window.location.href = "/login";

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default clientAxios;
