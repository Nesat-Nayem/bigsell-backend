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
exports.Hotel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const WeeklyTimingSchema = new mongoose_1.Schema({
    day: {
        type: String,
        required: true,
        trim: true
    },
    hours: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false });
const GalleryImageSchema = new mongoose_1.Schema({
    url: {
        type: String,
        required: true,
        trim: true
    },
    alt: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false });
const FoodOptionSchema = new mongoose_1.Schema({
    label: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    }
}, { _id: false });
const MenuItemSchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    spicy: {
        type: Boolean,
        default: false
    },
    isVeg: {
        type: Boolean,
        default: false
    },
    isEgg: {
        type: Boolean,
        default: false
    },
    isNonVeg: {
        type: Boolean,
        default: false
    },
    itemType: {
        type: [String],
        default: []
    },
    attributes: {
        type: [String],
        default: []
    },
    isQuick: {
        type: Boolean,
        default: false
    },
    isHighlyReordered: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 0
    },
    options: {
        type: [FoodOptionSchema],
        default: []
    },
    sortdesc: {
        type: String,
        trim: true
    },
    offer: {
        type: String,
        trim: true
    }
}, { _id: false });
const MenuCategorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    items: {
        type: [MenuItemSchema],
        default: []
    }
}, { _id: false });
const ReviewSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { _id: false });
const BuffetSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    days: {
        type: [String],
        required: true
    },
    hours: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    }
}, { _id: true });
const PreBookOfferSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    slots: {
        type: String,
        required: true,
        trim: true
    },
    buttonText: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false });
const WalkInOfferSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    validTime: {
        type: String,
        required: true,
        trim: true
    },
    icon: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false });
const BankBenefitSchema = new mongoose_1.Schema({
    bankName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        trim: true
    },
    bgColor: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false });
const FeaturedInSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false });
const AboutInfoSchema = new mongoose_1.Schema({
    established: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    priceForTwo: {
        type: String,
        required: true,
        trim: true
    },
    cuisineTypes: {
        type: [String],
        required: true
    },
    facilities: {
        type: [String],
        required: true
    },
    featuredIn: {
        type: FeaturedInSchema,
        required: true
    }
}, { _id: false });
const HotelSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    coordinates: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere' // Enable geospatial queries
        },
        address: {
            type: String,
            trim: true
        }
    },
    distance: {
        type: String,
        required: true,
        trim: true
    },
    cuisine: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    mainImage: {
        type: String,
        required: true
    },
    galleryImages: {
        type: [GalleryImageSchema],
        default: []
    },
    offer: {
        type: String,
        required: false,
        trim: true
    },
    weeklyTimings: {
        type: [WeeklyTimingSchema],
        default: []
    },
    menuCategories: {
        type: [MenuCategorySchema],
        default: []
    },
    menuItemTypes: {
        type: [String],
        default: ['Veg', 'Non-Veg', 'Contains Egg', 'Jain']
    },
    menuAttributes: {
        type: [String],
        default: ['Spicy', 'Sweet', 'Quick Preparation', 'Highly Reordered', 'Bestseller']
    },
    reviews: {
        type: [ReviewSchema],
        default: []
    },
    buffets: {
        type: [BuffetSchema],
        default: []
    },
    preBookOffers: {
        type: [PreBookOfferSchema],
        default: []
    },
    walkInOffers: {
        type: [WalkInOfferSchema],
        default: []
    },
    bankBenefits: {
        type: [BankBenefitSchema],
        default: []
    },
    aboutInfo: {
        type: AboutInfoSchema,
        default: null
    },
    vendorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    cgstRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    sgstRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    serviceCharge: {
        type: Number,
        default: 0,
        min: 0
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
exports.Hotel = mongoose_1.default.model('Hotel', HotelSchema);
