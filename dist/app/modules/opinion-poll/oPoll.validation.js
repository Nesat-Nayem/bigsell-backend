"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voteValidation = exports.opinionPollValidation = void 0;
const zod_1 = require("zod");
const optionSchema = zod_1.z.object({
    name: zod_1.z.string(),
    logo: zod_1.z.string().url(),
    percentageRange: zod_1.z.string(),
    weeklyChange: zod_1.z.string()
});
exports.opinionPollValidation = zod_1.z.object({
    question: zod_1.z.string(),
    options: zod_1.z.array(optionSchema),
    hashtags: zod_1.z.array(zod_1.z.string()),
    isDeleted: zod_1.z.boolean().optional()
});
exports.voteValidation = zod_1.z.object({
    optionIndex: zod_1.z.number().min(0)
});
