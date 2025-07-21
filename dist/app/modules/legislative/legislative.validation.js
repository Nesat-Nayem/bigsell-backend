"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.legislativeValidation = void 0;
const zod_1 = require("zod");
exports.legislativeValidation = zod_1.z.object({
    title: zod_1.z.string(),
    ministry: zod_1.z.string(),
    introducedIn: zod_1.z.string(),
    passedInLS: zod_1.z.string(),
    passedInRS: zod_1.z.string(),
    isDeleted: zod_1.z.boolean().optional(),
});
