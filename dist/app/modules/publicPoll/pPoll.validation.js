"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voteValidation = exports.publicPollValidation = void 0;
const zod_1 = require("zod");
exports.publicPollValidation = zod_1.z.object({
    question: zod_1.z.string(),
    options: zod_1.z.array(zod_1.z.string()),
    hashtags: zod_1.z.array(zod_1.z.string()),
    isDeleted: zod_1.z.boolean().optional(),
});
exports.voteValidation = zod_1.z.object({
    optionIndex: zod_1.z.number().min(0)
});
