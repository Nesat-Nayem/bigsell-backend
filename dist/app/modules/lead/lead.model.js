"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lead = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const LeadSchema = new mongoose_1.Schema({
    leadId: { type: String, required: true, unique: true },
    leadSource: { type: String, required: true },
    leadStatus: { type: String, required: true },
    enquiryId: { type: String, required: true },
    userInfo: {
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        email: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        location: {
            country: { type: String },
            state: { type: String },
            city: { type: String },
        },
    },
    serviceInfo: {
        serviceId: { type: String, required: true },
        serviceName: { type: String, required: true },
        serviceDescription: { type: String },
        serviceCost: { type: Number },
    },
    interactionHistory: [{
            contactDate: { type: Date },
            followUpDate: { type: Date },
            interactionNotes: { type: String },
            assignedTelecaller: { type: String },
        }],
    conversionDetails: {
        conversionStatus: { type: String, default: 'Pending' },
        conversionDate: { type: Date },
        conversionAmount: { type: Number },
        productPurchased: { type: String },
    },
    priorityLevel: { type: String },
    reasonForPriority: { type: String },
    notes: { type: String },
    attachments: [{ type: String }],
    assignedSalesManager: { type: String },
    assignedAreaZone: { type: String },
    nextFollowUpDate: { type: Date },
    leadOutcome: {
        outcome: { type: String, default: 'Pending' },
        reason: { type: String },
    },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
exports.Lead = mongoose_1.default.model('Lead', LeadSchema);
