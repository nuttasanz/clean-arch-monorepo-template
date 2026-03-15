"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import clientAxios from "@/lib/client-axios";
import { useAuthStore } from "../stores/auth.store";

export function useLogout() {
  const router = useRouter();
  const clearUser = useAuthStore((s) => s.clearUser);

  return useMutation({
    mutationFn: () => clientAxios.post("/api/auth/logout"),
    // onSettled (not onSuccess) — always clear state and redirect,
    // even if the backend revocation call fails.
    onSettled: () => {
      clearUser();
      router.push("/login");
    },
  });
}
