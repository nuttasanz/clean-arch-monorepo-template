"use server";

import { cookies } from "next/headers";
import serverAxios from "@/lib/server-axios";
import {
  loginUserSchema,
  registerUserSchema,
  type LoginUserDTO,
  type RegisterUserDTO,
  type IApiResponse,
} from "@my-project/shared-schema";
import { loginClientResponseSchema } from "../types/auth.types";
import type { AuthUser } from "../types/auth.types";

interface LoginBackendData {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

export async function loginAction(
  data: LoginUserDTO,
): Promise<{ user: AuthUser }> {
  const parsed = loginUserSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Validation failed");
  }

  let backendResponse;
  try {
    backendResponse = await serverAxios.post<IApiResponse<LoginBackendData>>(
      "/api/v1/auth/login",
      parsed.data,
    );
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error !== null && "response" in error
        ? ((error as { response?: { data?: { message?: string } } }).response
            ?.data?.message ?? "Login failed")
        : "An internal server error occurred";
    throw new Error(message);
  }

  const { data: responseBody } = backendResponse;

  if (responseBody.status !== "success" || !responseBody.data) {
    throw new Error(responseBody.message ?? "Login failed");
  }

  const { token, user } = responseBody.data;

  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return loginClientResponseSchema.parse({ user });
}

export async function registerAction(
  data: RegisterUserDTO,
): Promise<{ message: string }> {
  const parsed = registerUserSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Validation failed");
  }

  let backendResponse;
  try {
    backendResponse = await serverAxios.post<IApiResponse<unknown>>(
      "/api/v1/auth/register",
      parsed.data,
    );
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error !== null && "response" in error
        ? ((error as { response?: { data?: { message?: string } } }).response
            ?.data?.message ?? "Registration failed")
        : "An internal server error occurred";
    throw new Error(message);
  }

  const { data: responseBody } = backendResponse;
  return { message: responseBody.message ?? "Registration successful" };
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("token");
}
