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
exports.Product = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ProductSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    originalPrice: {
        type: Number,
        min: 0
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    },
    sku: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        index: true
    },
    subcategory: {
        type: String,
        trim: true
    },
    brand: {
        type: String,
        trim: true,
        index: true
    },
    images: [{
            type: String,
            required: true
        }],
    thumbnail: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    minStock: {
        type: Number,
        min: 0,
        default: 5
    },
    weight: {
        type: Number,
        min: 0
    },
    dimensions: {
        length: { type: Number, min: 0 },
        width: { type: Number, min: 0 },
        height: { type: Number, min: 0 }
    },
    colors: [{
            type: String,
            trim: true
        }],
    sizes: [{
            type: String,
            trim: true
        }],
    tags: [{
            type: String,
            trim: true,
            index: true
        }],
    features: [{
            type: String,
            trim: true
        }],
    specifications: {
        type: Map,
        of: String
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    reviewCount: {
        type: Number,
        min: 0,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'out_of_stock', 'discontinued'],
        default: 'active',
        index: true
    },
    isFeatured: {
        type: Boolean,
        default: false,
        index: true
    },
    isTrending: {
        type: Boolean,
        default: false,
        index: true
    },
    isNewArrival: {
        type: Boolean,
        default: false,
        index: true
    },
    seoTitle: {
        type: String,
        trim: true
    },
    seoDescription: {
        type: String,
        trim: true
    },
    seoKeywords: [{
            type: String,
            trim: true
        }],
    vendor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    shippingInfo: {
        weight: { type: Number, min: 0 },
        freeShipping: { type: Boolean, default: false },
        shippingCost: { type: Number, min: 0, default: 0 },
        estimatedDelivery: { type: String, trim: true }
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.createdAt = new Date(ret.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            ret.updatedAt = new Date(ret.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            return ret;
        }
    }
});
// Indexes for better query performance
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ price: 1, category: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ rating: -1, reviewCount: -1 });
// Virtual for calculating final price after discount
ProductSchema.virtual('finalPrice').get(function () {
    if (this.discount > 0) {
        if (this.discountType === 'percentage') {
            return this.price - (this.price * this.discount / 100);
        }
        else {
            return Math.max(0, this.price - this.discount);
        }
    }
    return this.price;
});
// Virtual for stock status
ProductSchema.virtual('stockStatus').get(function () {
    if (this.stock === 0)
        return 'out_of_stock';
    if (this.stock <= this.minStock)
        return 'low_stock';
    return 'in_stock';
});
// Pre-save middleware to update status based on stock
ProductSchema.pre('save', function (next) {
    if (this.stock === 0 && this.status === 'active') {
        this.status = 'out_of_stock';
    }
    else if (this.stock > 0 && this.status === 'out_of_stock') {
        this.status = 'active';
    }
    next();
});
exports.Product = mongoose_1.default.model('Product', ProductSchema);
