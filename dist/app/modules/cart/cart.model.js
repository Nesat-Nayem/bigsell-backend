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
exports.Cart = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Cart Item Schema
const CartItemSchema = new mongoose_1.Schema({
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    selectedColor: {
        type: String,
        trim: true,
    },
    selectedSize: {
        type: String,
        trim: true,
    },
}, { _id: false });
// Main Cart Schema
const CartSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // One cart per user
    },
    items: [CartItemSchema],
    totalItems: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalPrice: {
        type: Number,
        default: 0,
        min: 0,
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
                timeZone: 'Asia/Kolkata'
            });
            ret.updatedAt = new Date(ret.updatedAt).toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata'
            });
            return ret;
        }
    }
});
// Indexes for better performance
CartSchema.index({ user: 1, isDeleted: 1 });
CartSchema.index({ createdAt: -1 });
// Virtual for item count
CartSchema.virtual('itemCount').get(function () {
    return this.items.length;
});
// Pre-save middleware to calculate totals
CartSchema.pre('save', function (next) {
    if (this.items && this.items.length > 0) {
        this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
        this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    else {
        this.totalItems = 0;
        this.totalPrice = 0;
    }
    next();
});
// Static method to find user's cart
CartSchema.statics.findUserCart = function (userId) {
    return this.findOne({ user: userId, isDeleted: false })
        .populate('items.product', 'name price images thumbnail stock colors sizes')
        .populate('user', 'name email');
};
// Instance method to add item to cart
CartSchema.methods.addItem = function (productId, quantity, price, selectedColor, selectedSize) {
    const existingItemIndex = this.items.findIndex((item) => item.product.toString() === productId &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize);
    if (existingItemIndex > -1) {
        // Update existing item quantity
        this.items[existingItemIndex].quantity += quantity;
    }
    else {
        // Add new item
        this.items.push({
            product: productId,
            quantity,
            price,
            selectedColor,
            selectedSize,
        });
    }
    return this.save();
};
// Instance method to update item quantity
CartSchema.methods.updateItem = function (productId, quantity, selectedColor, selectedSize) {
    const itemIndex = this.items.findIndex((item) => item.product.toString() === productId &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize);
    if (itemIndex > -1) {
        if (quantity <= 0) {
            this.items.splice(itemIndex, 1);
        }
        else {
            this.items[itemIndex].quantity = quantity;
        }
        return this.save();
    }
    throw new Error('Item not found in cart');
};
// Instance method to remove item from cart
CartSchema.methods.removeItem = function (productId, selectedColor, selectedSize) {
    this.items = this.items.filter((item) => !(item.product.toString() === productId &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize));
    return this.save();
};
// Instance method to clear cart
CartSchema.methods.clearCart = function () {
    this.items = [];
    return this.save();
};
exports.Cart = mongoose_1.default.model('Cart', CartSchema);
