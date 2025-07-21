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
exports.Activity = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ActivitySchema = new mongoose_1.Schema({
    actorId: {
        type: String,
        required: true,
        trim: true
    },
    actorName: {
        type: String,
        required: true,
        trim: true
    },
    actorRole: {
        type: String,
        required: true,
        enum: ['admin', 'vendor', 'staff'],
        trim: true
    },
    action: {
        type: String,
        required: true,
        enum: ['create', 'update', 'delete', 'restore'],
        trim: true
    },
    entityType: {
        type: String,
        required: true,
        enum: ['restaurant', 'menu_category', 'menu_item', 'buffet', 'offer', 'about_info', 'gallery', 'settings'],
        trim: true
    },
    entityId: {
        type: String,
        required: true,
        trim: true
    },
    entityName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});
// Indexes for efficient querying
ActivitySchema.index({ timestamp: -1 });
ActivitySchema.index({ actorId: 1, timestamp: -1 });
ActivitySchema.index({ entityType: 1, timestamp: -1 });
ActivitySchema.index({ action: 1, timestamp: -1 });
ActivitySchema.index({ actorRole: 1, timestamp: -1 });
exports.Activity = mongoose_1.default.model('Activity', ActivitySchema);
