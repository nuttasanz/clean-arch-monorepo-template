// Validators
export {
  nameSchema,
  displayNameSchema,
  usernameSchema,
  phoneNumberSchema,
  passwordSchema,
} from "./validators";

// Enums
export { UserRole } from "./enums/user-role.enum";

// DTOs
export {
  registerUserSchema,
  type RegisterUserDTO,
} from "./dto/register-user.dto";
export { loginUserSchema, type LoginUserDTO } from "./dto/login-user.dto";
export {
  createUserByAdminSchema,
  type CreateUserByAdminDTO,
} from "./dto/create-user-by-admin.dto";

// API Response
export {
  type IValidationError,
  type AppErrorCode,
  type ApiMeta,
  type ApiSuccessResponse,
  type ApiErrorBody,
  type ApiErrorResponse,
} from "./api-response";

// Auth schemas & response types
export {
  authUserSchema,
  loginClientResponseSchema,
  registerClientResponseSchema,
  loginBackendResponseSchema,
  refreshBackendResponseSchema,
  type AuthUser,
  type LoginClientResponse,
  type RegisterClientResponse,
  type LoginBackendResponse,
  type RefreshBackendResponse,
} from "./auth.schema";
