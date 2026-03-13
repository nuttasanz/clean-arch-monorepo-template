import { create } from "zustand";
import type { AuthUser } from "../types/auth.types";

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
}

/**
 * Zustand auth store.
 * Stores ONLY user info (id, username, role) — the JWT token lives in
 * an HttpOnly cookie and is never accessible to client JavaScript.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
