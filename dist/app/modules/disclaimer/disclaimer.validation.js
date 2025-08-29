"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disclaimerValidation = void 0;
const zod_1 = require("zod");
exports.disclaimerValidation = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Disclaimer content is required')
});
