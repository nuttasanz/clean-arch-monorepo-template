"use client";

import axios from "axios";

/**
 * Client-side Axios instance for browser → Next.js BFF route handlers.
 * No Authorization header needed here — the HttpOnly cookie is sent automatically.
 * Global 401 interceptor clears auth state and redirects to /login.
 */
const clientAxios = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
  },
});

clientAxios.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const { useAuthStore } = await import(
        "@/features/auth/stores/auth.store"
      );
      useAuthStore.getState().clearUser();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default clientAxios;
