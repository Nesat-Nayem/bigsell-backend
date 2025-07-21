"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helpSupportValidation = void 0;
const zod_1 = require("zod");
exports.helpSupportValidation = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Help and support content is required')
});
