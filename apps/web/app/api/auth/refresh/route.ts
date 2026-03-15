import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import serverAxios from "@/lib/server-axios";
import type { ApiSuccessResponse, RefreshBackendResponse } from "@repo/shared";

/**
 * POST /api/auth/refresh
 *
 * BFF route: forwards the refreshToken HttpOnly cookie to the backend,
 * receives a new accessToken, rotates the refreshToken cookie, and returns
 * the new accessToken to the client.
 *
 * The client-side in-flight queue calls this endpoint to silently renew
 * the session without user interaction.
 */
export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: { message: "No refresh token" } }, { status: 401 });
  }

  let backendResponse;
  try {
    backendResponse = await serverAxios.post<
      ApiSuccessResponse<RefreshBackendResponse>
    >(
      "/api/v1/auth/refresh",
      {},
      { headers: { Cookie: `refreshToken=${refreshToken}` } },
    );
  } catch {
    return NextResponse.json(
      { error: { message: "Session expired" } },
      { status: 401 },
    );
  }

  const { accessToken } = backendResponse.data.data;

  // Rotate the refreshToken cookie: forward the new value from the backend.
  const setCookieHeaders = backendResponse.headers["set-cookie"] as
    | string[]
    | undefined;

  const newRefreshToken = extractSetCookieValue(setCookieHeaders, "refreshToken");

  const response = NextResponse.json({ data: { accessToken } }, { status: 200 });

  if (newRefreshToken) {
    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return response;
}

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
