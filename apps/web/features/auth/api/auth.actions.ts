"use server";

import { cookies } from "next/headers";
import serverAxios from "@/lib/server-axios";
import {
  loginUserSchema,
  registerUserSchema,
  type LoginUserDTO,
  type RegisterUserDTO,
  type ApiSuccessResponse,
  type LoginBackendResponse,
} from "@repo/shared";
import { loginClientResponseSchema } from "../types/auth.types";
import type { LoginClientResponse } from "../types/auth.types";

/**
 * Extracts a cookie value from an array of Set-Cookie header strings.
 * e.g. "refreshToken=abc123; Path=/; HttpOnly" → "abc123"
 */
function extractSetCookieValue(
  headers: string[] | undefined,
  name: string,
): string | null {
  for (const h of headers ?? []) {
    const semicolonIdx = h.indexOf(";");
    const pair = semicolonIdx === -1 ? h : h.slice(0, semicolonIdx);
    const eqIdx = pair.indexOf("=");
    if (eqIdx === -1) continue;
    const k = pair.slice(0, eqIdx).trim();
    const v = pair.slice(eqIdx + 1).trim();
    if (k === name) return v || null;
  }
  return null;
}

export async function loginAction(
  data: LoginUserDTO,
): Promise<LoginClientResponse> {
  const parsed = loginUserSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Validation failed");
  }

  let backendResponse;
  try {
    backendResponse = await serverAxios.post<
      ApiSuccessResponse<LoginBackendResponse>
    >("/api/v1/auth/login", parsed.data);
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error !== null && "response" in error
        ? ((error as { response?: { data?: { error?: { message?: string } } } })
            .response?.data?.error?.message ?? "Login failed")
        : "An internal server error occurred";
    throw new Error(message);
  }

  const { data: responseBody } = backendResponse;
  const { accessToken, user } = responseBody.data;

  // Forward the rotating refreshToken from the backend Set-Cookie header into
  // the Next.js layer as an HttpOnly cookie accessible to BFF route handlers.
  const setCookieHeaders = backendResponse.headers["set-cookie"] as
    | string[]
    | undefined;
  const refreshToken = extractSetCookieValue(setCookieHeaders, "refreshToken");

  const cookieStore = await cookies();

  if (refreshToken) {
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  return loginClientResponseSchema.parse({ accessToken, user });
}

export async function registerAction(
  data: RegisterUserDTO,
): Promise<LoginClientResponse> {
  const parsed = registerUserSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Validation failed");
  }

  let backendResponse;
  try {
    backendResponse = await serverAxios.post<
      ApiSuccessResponse<LoginBackendResponse>
    >("/api/v1/auth/register", parsed.data);
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error !== null && "response" in error
        ? ((error as { response?: { data?: { error?: { message?: string } } } })
            .response?.data?.error?.message ?? "Registration failed")
        : "An internal server error occurred";
    throw new Error(message);
  }

  const { data: responseBody } = backendResponse;
  const { accessToken, user } = responseBody.data;

  const setCookieHeaders = backendResponse.headers["set-cookie"] as
    | string[]
    | undefined;
  const refreshToken = extractSetCookieValue(setCookieHeaders, "refreshToken");

  const cookieStore = await cookies();

  if (refreshToken) {
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  return loginClientResponseSchema.parse({ accessToken, user });
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (refreshToken) {
    // Best-effort: tell the backend to revoke the refresh token.
    // We don't throw if this fails — cookie deletion below always runs.
    try {
      await serverAxios.post(
        "/api/v1/auth/logout",
        {},
        { headers: { Cookie: `refreshToken=${refreshToken}` } },
      );
    } catch {
      // ignore — backend may be unreachable; cookie is deleted regardless
    }
  }

  cookieStore.delete("refreshToken");
}
