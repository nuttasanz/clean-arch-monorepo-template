import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import serverAxios from "@/lib/server-axios";

/**
 * POST /api/auth/logout
 *
 * BFF route: forwards the refreshToken to the backend to revoke it (best-effort),
 * then deletes the refreshToken HttpOnly cookie from the browser.
 */
export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (refreshToken) {
    try {
      await serverAxios.post(
        "/api/v1/auth/logout",
        {},
        { headers: { Cookie: `refreshToken=${refreshToken}` } },
      );
    } catch {
      // Best-effort: if backend is unreachable the cookie is still deleted below.
    }
  }

  const response = NextResponse.json(null, { status: 200 });
  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}
