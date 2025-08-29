"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentPolicyValidation = void 0;
const zod_1 = require("zod");
exports.paymentPolicyValidation = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Payment policy content is required')
});
