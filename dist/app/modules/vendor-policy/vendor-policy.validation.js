"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorPolicyValidation = void 0;
const zod_1 = require("zod");
exports.vendorPolicyValidation = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Vendor policy content is required')
});
