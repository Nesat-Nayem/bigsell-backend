"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shippingPolicyValidation = void 0;
const zod_1 = require("zod");
exports.shippingPolicyValidation = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Shipping policy content is required')
});
