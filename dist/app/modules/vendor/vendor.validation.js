"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorUpdateValidation = exports.vendorUpdateStatusValidation = exports.vendorApplyValidation = void 0;
const zod_1 = require("zod");
exports.vendorApplyValidation = zod_1.z.object({
    vendorName: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().min(5),
    address: zod_1.z.string().min(1),
    gstNo: zod_1.z.string().optional(),
    subscriptionId: zod_1.z.string().optional(),
    planName: zod_1.z.string().min(1),
    planPrice: zod_1.z.number().optional(),
    planBillingCycle: zod_1.z.enum(['monthly', 'yearly']).optional(),
    planColor: zod_1.z.string().optional(),
    aadharUrl: zod_1.z.string().url(),
    panUrl: zod_1.z.string().url(),
    paymentStatus: zod_1.z.enum(['pending', 'done', 'failed']).optional(),
    paymentAmount: zod_1.z.number().optional(),
});
exports.vendorUpdateStatusValidation = zod_1.z.object({
    kycStatus: zod_1.z.enum(['pending', 'approved', 'rejected']),
});
exports.vendorUpdateValidation = zod_1.z.object({
    vendorName: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    gstNo: zod_1.z.string().optional(),
    paymentStatus: zod_1.z.enum(['pending', 'done', 'failed']).optional(),
    paymentAmount: zod_1.z.number().optional(),
});
