"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordSchema = exports.phoneNumberSchema = exports.usernameSchema = exports.displayNameSchema = exports.nameSchema = void 0;
const zod_1 = require("zod");
exports.nameSchema = zod_1.z
    .string()
    .regex(/^[a-zA-Z\u0E00-\u0E7F]+$/)
    .optional();
exports.displayNameSchema = zod_1.z
    .string()
    .regex(/^[a-zA-Z0-9\u0E00-\u0E7F ]+$/)
    .optional();
exports.usernameSchema = zod_1.z
    .string()
    .min(4)
    .regex(/^[a-zA-Z0-9]+$/);
exports.phoneNumberSchema = zod_1.z
    .string()
    .length(10)
    .regex(/^[a-zA-Z0-9]+$/)
    .optional();
exports.passwordSchema = zod_1.z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/);
