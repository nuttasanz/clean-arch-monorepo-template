"use client";

import { useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { UserRole } from "@repo/shared";

interface JwtPayload {
  sub: string;
  username: string;
  role: string;
}

/**
 * Silently rehydrates auth state on page load/refresh.
 *
 * Zustand is memory-only — its state is lost on a hard refresh. This component
 * fires once on mount: if the user object is absent (page was refreshed), it
 * calls the BFF refresh endpoint. A valid refreshToken HttpOnly cookie will
 * yield a new accessToken, whose payload we decode to restore the user object.
 *
 * If no refreshToken cookie exists (or it has expired), the call fails silently
 * and the middleware will redirect to /login on the next protected navigation.
 */
export function SessionInitializer() {
  useEffect(() => {
    if (useAuthStore.getState().user !== null) return;

    axios
      .post<{ data: { accessToken: string } }>("/api/auth/refresh")
      .then(({ data }) => {
        const token = data.data.accessToken;

        // Decode the JWT payload (base64url). No signature verification needed
        // here — the token was just issued by our own BFF in the same call.
        const payloadB64 = token.split(".")[1];
        if (!payloadB64) return;

        const payload = JSON.parse(
          atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")),
        ) as JwtPayload;

        const store = useAuthStore.getState();
        store.setAccessToken(token);
        store.setUser({
          id: payload.sub,
          username: payload.username,
          role: payload.role as UserRole,
        });
      })
      .catch(() => {
        // No valid session — middleware will handle redirect on next navigation.
      });
  }, []);

  return null;
}
