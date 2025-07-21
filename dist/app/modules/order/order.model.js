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
exports.Order = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const OrderItemSchema = new mongoose_1.Schema({
    menuItem: {
        type: String,
        required: true
    },
    hotelId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    size: {
        type: String,
        required: true
    },
    addons: [{
            key: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }],
    price: {
        type: Number,
        required: true
    },
    specialInstructions: {
        type: String,
        default: ""
    },
    orderedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'preparing', 'served', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'razorpay', 'manual'],
        required: true
    },
    itemPaymentStatus: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    }
}, { _id: true });
const CreatedBySchema = new mongoose_1.Schema({
    id: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    role: {
        type: String,
        enum: ['staff', 'user', 'admin'],
        required: true
    }
}, { _id: false });
const OrderSchema = new mongoose_1.Schema({
    users: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    items: [OrderItemSchema],
    subtotal: {
        type: Number,
        required: true
    },
    cgstAmount: {
        type: Number,
        required: true
    },
    sgstAmount: {
        type: Number,
        required: true
    },
    serviceCharge: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentDetails: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'razorpay', 'manual'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'partially-paid', 'paid', 'failed'],
        default: 'pending'
    },
    tableNumber: {
        type: String,
        trim: true,
        default: null,
    },
    paymentId: {
        type: String
    },
    couponCode: {
        type: String,
        default: null
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    amountPaid: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: CreatedBySchema,
        default: null
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.createdAt = new Date(ret.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            ret.updatedAt = new Date(ret.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        }
    }
});
exports.Order = mongoose_1.default.model('Order', OrderSchema);
