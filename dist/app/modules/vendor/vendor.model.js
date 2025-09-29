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
exports.VendorApplication = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const VendorApplicationSchema = new mongoose_1.Schema({
    vendorName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    address: { type: String, required: true, trim: true },
    gstNo: { type: String, trim: true },
    subscriptionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Subscription' },
    planName: { type: String, trim: true },
    planPrice: { type: Number },
    planBillingCycle: { type: String, enum: ['monthly', 'yearly'] },
    planColor: { type: String },
    aadharUrl: { type: String, required: true },
    panUrl: { type: String, required: true },
    paymentStatus: { type: String, enum: ['pending', 'done', 'failed'], default: 'pending' },
    paymentAmount: { type: Number },
    kycStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    credentialSent: { type: Boolean, default: false },
    vendorUserId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false, index: true },
}, {
    timestamps: true,
});
VendorApplicationSchema.index({ createdAt: -1 });
exports.VendorApplication = mongoose_1.default.model('VendorApplication', VendorApplicationSchema);
