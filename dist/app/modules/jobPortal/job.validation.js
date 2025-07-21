"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobValidation = void 0;
const zod_1 = require("zod");
exports.jobValidation = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    technology: zod_1.z.array(zod_1.z.string()),
    location: zod_1.z.string(),
    salary: zod_1.z.number(),
    department: zod_1.z.string(),
    jobType: zod_1.z.string(),
    tags: zod_1.z.array(zod_1.z.string()),
    isDeleted: zod_1.z.boolean().optional(),
});
