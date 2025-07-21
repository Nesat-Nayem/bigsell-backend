"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voterValidation = void 0;
const zod_1 = require("zod");
exports.voterValidation = zod_1.z.object({
    name: zod_1.z.string(),
    dob: zod_1.z.string(),
    location: zod_1.z.string(),
    img: zod_1.z.string(),
    state: zod_1.z.string(),
    district: zod_1.z.string(),
    constituency: zod_1.z.string(),
    division: zod_1.z.string(),
    isDeleted: zod_1.z.boolean().optional(),
});
