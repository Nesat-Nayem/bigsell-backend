"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slotValidation = void 0;
const zod_1 = require("zod");
exports.slotValidation = zod_1.z.object({
    service: zod_1.z.string(),
    date: zod_1.z.string(),
    startTime: zod_1.z.string(),
    endTime: zod_1.z.string(),
});
