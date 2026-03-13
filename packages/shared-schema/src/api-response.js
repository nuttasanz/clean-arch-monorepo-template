"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    static success(message, data) {
        return {
            status: "success",
            message,
            data,
        };
    }
    static error(message, errors) {
        return {
            status: "error",
            message,
            errors,
        };
    }
}
exports.ApiResponse = ApiResponse;
