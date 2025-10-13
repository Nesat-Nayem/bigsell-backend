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
exports.Coupon = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CouponSchema = new mongoose_1.Schema({
    code: { type: String, required: true, unique: true, trim: true },
    discountType: {
        type: String,
        enum: ['percentage', 'flat'],
        default: 'percentage',
        required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscountAmount: { type: Number, min: 0 },
    minOrderAmount: { type: Number, min: 0, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    vendor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', default: null },
    isDeleted: { type: Boolean, default: false, index: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', default: null },
}, {
    timestamps: true,
    toJSON: {
        transform: function (_doc, ret) {
            ret.createdAt = new Date(ret.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            ret.updatedAt = new Date(ret.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            return ret;
        },
    },
});
CouponSchema.pre('save', function (next) {
    if (this.code) {
        this.code = String(this.code).trim().toUpperCase();
    }
    if (this.startDate && this.endDate) {
        if (new Date(this.startDate) > new Date(this.endDate)) {
            return next(new Error('startDate cannot be after endDate'));
        }
    }
    next();
});
CouponSchema.index({ code: 1 }, { unique: true });
exports.Coupon = mongoose_1.default.model('Coupon', CouponSchema);
