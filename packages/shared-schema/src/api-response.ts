export interface IValidationError {
  field: string;
  message: string;
}

export interface IApiResponse<T = unknown> {
  status: "success" | "error";
  message: string;
  data?: T;
  errors?: IValidationError[];
}

export class ApiResponse {
  static success<T>(message: string, data?: T): IApiResponse<T> {
    return {
      status: "success",
      message,
      data,
    };
  }

  static error(message: string, errors?: IValidationError[]): IApiResponse {
    return {
      status: "error",
      message,
      errors,
    };
  }
}
