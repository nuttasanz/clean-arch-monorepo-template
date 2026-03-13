import clientAxios from "@/lib/client-axios";
import type { LoginUserDTO, RegisterUserDTO } from "@my-project/shared-schema";
import {
  loginClientResponseSchema,
  registerClientResponseSchema,
  type LoginClientResponse,
  type RegisterClientResponse,
} from "../types/auth.types";

export async function loginUser(data: LoginUserDTO): Promise<LoginClientResponse> {
  const response = await clientAxios.post<unknown>("/api/auth/login", data);
  return loginClientResponseSchema.parse(response.data);
}

export async function registerUser(
  data: RegisterUserDTO,
): Promise<RegisterClientResponse> {
  const response = await clientAxios.post<unknown>("/api/auth/register", data);
  return registerClientResponseSchema.parse(response.data);
}
