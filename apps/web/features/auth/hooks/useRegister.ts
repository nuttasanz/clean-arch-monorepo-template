"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { registerUser } from "../api/auth.repository";
import type { RegisterUserDTO } from "@my-project/shared-schema";
import axios from "axios";

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterUserDTO) => registerUser(data),
    onSuccess: ({ message }) => {
      notifications.show({
        color: "green",
        title: "Registration successful!",
        message: message ?? "Your account has been created. Please log in.",
      });
      router.push("/login");
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { message?: string })?.message ??
          "Registration failed. Please try again.")
        : "An unexpected error occurred.";
      notifications.show({
        color: "red",
        title: "Registration failed",
        message,
      });
    },
  });
}
