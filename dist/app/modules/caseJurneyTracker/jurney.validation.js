"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jurneyValidation = void 0;
const zod_1 = require("zod");
exports.jurneyValidation = zod_1.z.object({
    title: zod_1.z.string(),
    imageUrl: zod_1.z.string(),
    isDeleted: zod_1.z.boolean().optional(),
});
