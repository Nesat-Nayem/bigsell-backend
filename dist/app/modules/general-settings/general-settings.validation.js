"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalSettingsUpdateValidation = void 0;
const zod_1 = require("zod");
exports.generalSettingsUpdateValidation = zod_1.z.object({
    number: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email().optional(),
    facebook: zod_1.z.string().url().optional(),
    instagram: zod_1.z.string().url().optional(),
    linkedIn: zod_1.z.string().url().optional(),
    twitter: zod_1.z.string().url().optional(),
    youtube: zod_1.z.string().url().optional(),
    headerTab: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    iframe: zod_1.z.string().optional(),
    freeShippingThreshold: zod_1.z
        .preprocess((v) => {
        if (v === undefined || v === null || v === '')
            return undefined;
        if (typeof v === 'number')
            return v;
        const n = Number(v);
        return isNaN(n) ? undefined : n;
    }, zod_1.z.number().min(0))
        .optional(),
});
