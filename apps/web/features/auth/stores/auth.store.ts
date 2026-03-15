import { create } from "zustand";
import type { AuthUser } from "../types/auth.types";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  setUser: (user: AuthUser) => void;
  setAccessToken: (token: string) => void;
  clearUser: () => void;
}

/**
 * Zustand auth store.
 * - user: id, username, role — safe to keep in memory
 * - accessToken: short-lived JWT (15min) — memory only, never in cookie or localStorage
 * - refreshToken: managed exclusively via HttpOnly cookie at the BFF layer
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  setUser: (user) => set({ user }),
  setAccessToken: (token) => set({ accessToken: token }),
  clearUser: () => set({ user: null, accessToken: null }),
}));
