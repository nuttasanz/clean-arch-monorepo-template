import { NextRequest, NextResponse } from "next/server";
import { registerUserSchema } from "@my-project/shared-schema";
import serverAxios from "@/lib/server-axios";
import type { IApiResponse } from "@my-project/shared-schema";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = registerUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.issues },
        { status: 400 },
      );
    }

    const backendResponse = await serverAxios.post<IApiResponse<unknown>>(
      "/auth/register",
      parsed.data,
    );

    const { data: responseBody } = backendResponse;

    return NextResponse.json(
      { message: responseBody.message ?? "Registration successful" },
      { status: 201 },
    );
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
      typeof error === "object" &&
      error !== null &&
      "response" in error
        ? (
            (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message ?? "An error occurred"
          )
        : "An internal server error occurred";

    return NextResponse.json({ message }, { status });
  }
}
