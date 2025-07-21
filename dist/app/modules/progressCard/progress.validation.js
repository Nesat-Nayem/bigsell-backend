"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.progressValidation = void 0;
const zod_1 = require("zod");
exports.progressValidation = zod_1.z.object({
    title: zod_1.z.string(),
    images: zod_1.z.array(zod_1.z.string()),
    isDeleted: zod_1.z.boolean().optional(),
});
