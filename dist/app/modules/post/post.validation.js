"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inqueryValidation = void 0;
const zod_1 = require("zod");
exports.inqueryValidation = zod_1.z.object({
    userName: zod_1.z.string(),
    img: zod_1.z.array(zod_1.z.string()).optional(),
    audio: zod_1.z.array(zod_1.z.string()).optional(),
    video: zod_1.z.array(zod_1.z.string()).optional(),
    location: zod_1.z.string(),
    postText: zod_1.z.string().nullable().optional(),
    status: zod_1.z.enum(['pending', 'completed', 'fake', 'onprocess']).default('pending'),
    isDeleted: zod_1.z.boolean().optional(),
});
