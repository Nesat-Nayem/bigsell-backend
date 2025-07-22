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
exports.Wishlist = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Wishlist Item Schema
const WishlistItemSchema = new mongoose_1.Schema({
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    addedAt: {
        type: Date,
        default: Date.now,
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500,
    },
}, { _id: false });
// Main Wishlist Schema
const WishlistSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // One wishlist per user
    },
    items: [WishlistItemSchema],
    totalItems: {
        type: Number,
        default: 0,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.createdAt = new Date(ret.createdAt).toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
            });
            ret.updatedAt = new Date(ret.updatedAt).toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
            });
            return ret;
        }
    }
});
// Indexes for better performance
WishlistSchema.index({ user: 1 });
WishlistSchema.index({ user: 1, isDeleted: 1 });
WishlistSchema.index({ 'items.product': 1 });
WishlistSchema.index({ 'items.addedAt': -1 });
// Pre-save middleware to update totalItems
WishlistSchema.pre('save', function (next) {
    if (this.isModified('items')) {
        this.totalItems = this.items.length;
    }
    next();
});
// Static method to find or create user wishlist
WishlistSchema.statics.findOrCreateUserWishlist = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        let wishlist = yield this.findOne({ user: userId, isDeleted: false });
        if (!wishlist) {
            wishlist = new this({
                user: userId,
                items: [],
                totalItems: 0,
            });
            yield wishlist.save();
        }
        return wishlist;
    });
};
// Instance method to add item to wishlist
WishlistSchema.methods.addItem = function (productId, notes) {
    // Check if item already exists
    const existingItemIndex = this.items.findIndex((item) => item.product.toString() === productId);
    if (existingItemIndex !== -1) {
        // Update existing item
        if (notes) {
            this.items[existingItemIndex].notes = notes;
        }
        this.items[existingItemIndex].addedAt = new Date();
    }
    else {
        // Add new item
        this.items.push({
            product: productId,
            addedAt: new Date(),
            notes: notes || '',
        });
    }
    this.totalItems = this.items.length;
    return this.save();
};
// Instance method to remove item from wishlist
WishlistSchema.methods.removeItem = function (productId) {
    this.items = this.items.filter((item) => item.product.toString() !== productId);
    this.totalItems = this.items.length;
    return this.save();
};
// Instance method to clear wishlist
WishlistSchema.methods.clearWishlist = function () {
    this.items = [];
    this.totalItems = 0;
    return this.save();
};
// Instance method to check if item exists in wishlist
WishlistSchema.methods.hasItem = function (productId) {
    return this.items.some((item) => item.product.toString() === productId);
};
// Instance method to update item notes
WishlistSchema.methods.updateItemNotes = function (productId, notes) {
    const itemIndex = this.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex !== -1) {
        this.items[itemIndex].notes = notes;
        return this.save();
    }
    else {
        throw new Error('Item not found in wishlist');
    }
};
// Virtual for recent items (added in last 7 days)
WishlistSchema.virtual('recentItems').get(function () {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return this.items.filter((item) => item.addedAt >= sevenDaysAgo);
});
// Virtual for items count by category (requires population)
WishlistSchema.virtual('itemsByCategory').get(function () {
    const categoryMap = new Map();
    this.items.forEach((item) => {
        if (item.product && item.product.category) {
            const categoryId = item.product.category._id || item.product.category;
            const categoryName = item.product.category.name || 'Unknown';
            if (categoryMap.has(categoryId.toString())) {
                categoryMap.get(categoryId.toString()).count++;
            }
            else {
                categoryMap.set(categoryId.toString(), {
                    categoryId: categoryId.toString(),
                    categoryName,
                    count: 1,
                });
            }
        }
    });
    return Array.from(categoryMap.values());
});
exports.Wishlist = mongoose_1.default.model('Wishlist', WishlistSchema);
