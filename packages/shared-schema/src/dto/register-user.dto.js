"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserSchema = void 0;
const zod_1 = require("zod");
const validators_1 = require("../validators");
exports.registerUserSchema = zod_1.z.object({
    firstName: validators_1.nameSchema,
    lastName: validators_1.nameSchema,
    displayName: validators_1.displayNameSchema,
    username: validators_1.usernameSchema,
    email: zod_1.z.email(),
    password: validators_1.passwordSchema,
    phoneNumber: validators_1.phoneNumberSchema,
});
