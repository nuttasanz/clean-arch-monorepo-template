import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loginUserSchema } from "@my-project/shared-schema";
import serverAxios from "@/lib/server-axios";
import type { IApiResponse } from "@my-project/shared-schema";

interface LoginBackendData {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = loginUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.issues },
        { status: 400 },
      );
    }

    const backendResponse = await serverAxios.post<
      IApiResponse<LoginBackendData>
    >("/auth/login", parsed.data);

    const { data: responseBody } = backendResponse;

    if (responseBody.status !== "success" || !responseBody.data) {
      return NextResponse.json(
        { message: responseBody.message ?? "Login failed" },
        { status: 401 },
      );
    }

    const { token, user } = responseBody.data;

    // Store token in HttpOnly cookie — never exposed to client JS
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Return only user info to the client, never the token
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: unknown) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: { status?: number } }).response?.status ===
        "number"
        ? (error as { response: { status: number } }).response.status
        : 500;

    const message =
      typeof error === "object" && error !== null && "response" in error
        ? ((error as { response?: { data?: { message?: string } } }).response
            ?.data?.message ?? "An error occurred")
        : "An internal server error occurred";

    return NextResponse.json({ message }, { status });
  }
}
