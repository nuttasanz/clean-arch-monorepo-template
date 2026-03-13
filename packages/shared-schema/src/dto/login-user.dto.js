"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUserSchema = void 0;
const zod_1 = require("zod");
const validators_1 = require("../validators");
exports.loginUserSchema = zod_1.z.object({
    username: validators_1.usernameSchema,
    password: validators_1.passwordSchema,
});
