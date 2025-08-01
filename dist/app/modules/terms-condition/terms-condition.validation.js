"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TermsConditionValidation = void 0;
const zod_1 = require("zod");
exports.TermsConditionValidation = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Privacy policy content is required')
});
