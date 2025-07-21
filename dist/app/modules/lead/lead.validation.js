"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadValidation = void 0;
const zod_1 = require("zod");
exports.leadValidation = zod_1.z.object({
    leadId: zod_1.z.string(),
    leadSource: zod_1.z.string(),
    leadStatus: zod_1.z.string(),
    enquiryId: zod_1.z.string(),
    userInfo: zod_1.z.object({
        userId: zod_1.z.string(),
        userName: zod_1.z.string(),
        email: zod_1.z.string().email(),
        phoneNumber: zod_1.z.string(),
        location: zod_1.z.object({
            country: zod_1.z.string().optional(),
            state: zod_1.z.string().optional(),
            city: zod_1.z.string().optional(),
        }).optional(),
    }),
    serviceInfo: zod_1.z.object({
        serviceId: zod_1.z.string(),
        serviceName: zod_1.z.string(),
        serviceDescription: zod_1.z.string().optional(),
        serviceCost: zod_1.z.number().optional(),
    }),
    interactionHistory: zod_1.z.array(zod_1.z.object({
        contactDate: zod_1.z.string().datetime().optional(),
        followUpDate: zod_1.z.string().datetime().optional(),
        interactionNotes: zod_1.z.string().optional(),
        assignedTelecaller: zod_1.z.string().optional(),
    })).optional(),
    conversionDetails: zod_1.z.object({
        conversionStatus: zod_1.z.string().optional(),
        conversionDate: zod_1.z.string().datetime().nullable().optional(),
        conversionAmount: zod_1.z.number().nullable().optional(),
        productPurchased: zod_1.z.string().nullable().optional(),
    }).optional(),
    priorityLevel: zod_1.z.string().optional(),
    reasonForPriority: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    attachments: zod_1.z.array(zod_1.z.string()).optional(),
    assignedSalesManager: zod_1.z.string().optional(),
    assignedAreaZone: zod_1.z.string().optional(),
    nextFollowUpDate: zod_1.z.string().datetime().optional(),
    leadOutcome: zod_1.z.object({
        outcome: zod_1.z.string().optional(),
        reason: zod_1.z.string().nullable().optional(),
    }).optional(),
    isDeleted: zod_1.z.boolean().optional()
});
