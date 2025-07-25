"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cityValidation = void 0;
const zod_1 = require("zod");
exports.cityValidation = zod_1.z.object({
    name: zod_1.z.string(),
    isDeleted: zod_1.z.boolean().optional(),
});
