"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inqueryValidation = void 0;
const zod_1 = require("zod");
exports.inqueryValidation = zod_1.z.object({
    name: zod_1.z.string(),
    isoCode: zod_1.z.string(),
    isDeleted: zod_1.z.boolean().optional(),
});
