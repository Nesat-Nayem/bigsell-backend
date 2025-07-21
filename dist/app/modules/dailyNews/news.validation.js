"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsValidation = void 0;
const zod_1 = require("zod");
exports.newsValidation = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    image: zod_1.z.string(),
    isDeleted: zod_1.z.boolean().optional(),
});
