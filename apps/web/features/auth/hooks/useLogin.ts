"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { loginUser } from "../api/auth.repository";
import { useAuthStore } from "../stores/auth.store";
import type { LoginUserDTO } from "@my-project/shared-schema";

export function useLogin() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: LoginUserDTO) => loginUser(data),
    onSuccess: ({ user }) => {
      setUser(user);
      router.push("/");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";
      notifications.show({
        color: "red",
        title: "Login failed",
        message,
      });
    },
  });
}
