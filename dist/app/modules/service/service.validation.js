"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceValidation = void 0;
const zod_1 = require("zod");
exports.serviceValidation = zod_1.z.object({
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    price: zod_1.z.number().positive(),
    img: zod_1.z.string(),
    isDeleted: zod_1.z.boolean().optional(),
});
