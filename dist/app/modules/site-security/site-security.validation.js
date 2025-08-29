"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.siteSecurityValidation = void 0;
const zod_1 = require("zod");
exports.siteSecurityValidation = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Site security content is required')
});
