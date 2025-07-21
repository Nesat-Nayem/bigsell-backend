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
exports.TableBooking = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TableBookingSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hotelId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    tableId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'QRCode',
        required: true
    },
    tableNumber: {
        type: String,
        required: true
    },
    seatNumber: {
        type: Number,
        required: true,
        min: 1
    },
    guestCount: {
        type: Number,
        required: true,
        min: 1
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    mealType: {
        type: String,
        required: true
    },
    offerApplied: {
        type: String,
        default: ''
    },
    offerDiscount: {
        type: String,
        default: ''
    },
    coverCharge: {
        type: Number,
        default: 0
    },
    bookingPrice: {
        type: Number,
        required: true,
        default: 300
    },
    specialRequests: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Refunded'],
        default: 'Pending'
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
exports.TableBooking = mongoose_1.default.model('TableBooking', TableBookingSchema);
