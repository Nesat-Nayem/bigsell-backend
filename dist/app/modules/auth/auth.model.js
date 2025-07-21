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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const MenuBookmarkSchema = new mongoose_1.Schema({
    menuItemId: {
        type: String,
        required: true
    },
    hotelId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    hotelName: {
        type: String,
        required: true
    },
    menuTitle: {
        type: String,
        required: true
    },
    menuImage: {
        type: String,
        required: true
    },
    menuPrice: {
        type: Number,
        required: true
    },
    bookmarkedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });
const userSchema = new mongoose_1.Schema({
    name: { type: String },
    password: { type: String },
    phone: { type: String, required: true },
    email: { type: String },
    img: { type: String },
    role: { type: String, enum: ['admin', 'vendor', 'user'], default: 'user' },
    status: { type: String, enum: ['pending', 'active'], default: 'active' },
    otp: { type: String },
    otpExpires: { type: Date },
    packageFeatures: {
        type: [String],
        default: []
    },
    menuBookmarks: {
        type: [MenuBookmarkSchema],
        default: []
    },
}, { timestamps: true });
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password')) {
            return next();
        }
        const salt = yield bcrypt_1.default.genSalt(10);
        this.password = yield bcrypt_1.default.hash(this.password, salt);
        next();
    });
});
userSchema.methods.comparePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcrypt_1.default.compare(password, this.password);
    });
};
// Add method to compare OTP
userSchema.methods.compareOtp = function (otp) {
    return this.otp === otp && this.otpExpires && this.otpExpires > new Date();
};
// Add index for phone
userSchema.index({ phone: 1 }, { unique: true });
exports.User = mongoose_1.default.model('User', userSchema);
