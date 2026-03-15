export interface IValidationError {
  field: string;
  message: string;
}

export type AppErrorCode =
  | 'INTERNAL_SERVER_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'BAD_REQUEST'
  | 'UNPROCESSABLE_ENTITY';

export interface ApiMeta {
  traceId: string;
}

export interface ApiSuccessResponse<T = unknown> {
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorBody {
  message: string;
  code: AppErrorCode;
  details?: IValidationError[];
}

export interface ApiErrorResponse {
  error: ApiErrorBody;
  meta: ApiMeta;
}
