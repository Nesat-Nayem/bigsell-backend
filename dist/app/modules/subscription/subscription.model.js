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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const mongoose_1 = __importStar(require("mongoose"));
function slugify(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}
const SubscriptionSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    slug: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
        index: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        default: 'INR',
        uppercase: true,
        trim: true,
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'yearly'],
        default: 'monthly',
    },
    color: {
        type: String,
        trim: true, // e.g., 'secondary' | 'warning' | 'info'
        default: 'secondary',
    },
    includeIds: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'SubscriptionInclude',
        default: [],
    },
    features: {
        type: [String],
        default: [],
    },
    order: {
        type: Number,
        default: 0,
        min: 0,
        index: true,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true,
    },
    // SEO
    metaTitle: { type: String, trim: true },
    metaTags: { type: [String], default: [] },
    metaDescription: { type: String, trim: true },
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.createdAt = new Date(ret.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            ret.updatedAt = new Date(ret.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            return ret;
        },
    },
});
// Indexes
SubscriptionSchema.index({ isActive: 1, isDeleted: 1 });
SubscriptionSchema.index({ order: 1, createdAt: -1 });
// Pre-save to generate unique slug if not provided and enforce max 3 active
SubscriptionSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!this.slug && this.name) {
                let base = slugify(this.name);
                let finalSlug = base;
                let counter = 1;
                // Ensure unique slug
                while (yield mongoose_1.default.models.Subscription.findOne({ slug: finalSlug, _id: { $ne: this._id } })) {
                    finalSlug = `${base}-${counter++}`;
                }
                this.slug = finalSlug;
            }
            // Enforce at most 3 active (non-deleted)
            if (this.isModified('isActive') || this.isNew) {
                if (this.isActive === true) {
                    const count = yield mongoose_1.default.models.Subscription.countDocuments({ isActive: true, isDeleted: false, _id: { $ne: this._id } });
                    if (count >= 3) {
                        return next(new Error('Maximum 3 active subscription plans are allowed. Please deactivate another plan first.'));
                    }
                }
            }
            next();
        }
        catch (err) {
            next(err);
        }
    });
});
exports.Subscription = mongoose_1.default.model('Subscription', SubscriptionSchema);
