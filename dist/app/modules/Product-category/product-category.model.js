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
exports.ProductCategory = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Schema for dynamic attributes
const AttributeSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        required: true,
    },
    required: {
        type: Boolean,
        default: false,
    },
    options: [
        {
            type: String,
            trim: true,
        },
    ],
    defaultValue: {
        type: mongoose_1.Schema.Types.Mixed,
    },
}, { _id: false });
// Helper function to generate slug
function generateSlug(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}
const CategorySchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: false,
        unique: true,
        lowercase: true,
    },
    description: {
        type: String,
        trim: true,
    },
    image: {
        type: String,
    },
    icon: {
        type: String, // For category icons (FontAwesome, material icons, etc.)
    },
    // Hierarchical structure
    parentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "ProductCategory",
        default: null,
    },
    level: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        max: 5, // Maximum depth of 5 levels
    },
    path: {
        type: String,
        required: false,
        index: true,
    },
    // Dynamic attributes
    attributes: [AttributeSchema],
    // Category settings
    isActive: {
        type: Boolean,
        default: true,
    },
    displayOrder: {
        type: Number,
        default: 0,
    },
    // SEO fields
    seoTitle: {
        type: String,
        trim: true,
    },
    seoDescription: {
        type: String,
        trim: true,
    },
    seoKeywords: [
        {
            type: String,
            trim: true,
        },
    ],
    // Metadata
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.createdAt = new Date(ret.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
            ret.updatedAt = new Date(ret.updatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
            return ret;
        },
    },
    toObject: {
        virtuals: true,
    },
});
// Indexes for performance
CategorySchema.index({ parentId: 1, displayOrder: 1 });
CategorySchema.index({ level: 1 });
CategorySchema.index({ isActive: 1, isDeleted: 1 });
// Optimized compound index for getCategoryTree filtering and sorting
CategorySchema.index({ parentId: 1, isDeleted: 1, isActive: 1, displayOrder: 1, title: 1 });
// Virtual for children
CategorySchema.virtual("children", {
    ref: "ProductCategory",
    localField: "_id",
    foreignField: "parentId",
    match: { isDeleted: false },
});
// Virtual for parent
CategorySchema.virtual("parent", {
    ref: "ProductCategory",
    localField: "parentId",
    foreignField: "_id",
    justOne: true,
});
// Virtual for full path with titles
CategorySchema.virtual("fullPath").get(function () {
    return this.path ? this.path.split("/").join(" > ") : this.title || "";
});
// Pre-save middleware to generate slug and path
CategorySchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // Generate slug if not provided
        if (!this.slug) {
            this.slug = generateSlug(this.title);
        }
        // Ensure slug is unique
        if (this.isModified("slug") || this.isNew) {
            const baseSlug = this.slug;
            let counter = 1;
            let finalSlug = baseSlug;
            while (yield mongoose_1.default.models.ProductCategory.findOne({
                slug: finalSlug,
                _id: { $ne: this._id },
                isDeleted: false,
            })) {
                finalSlug = `${baseSlug}-${counter}`;
                counter++;
            }
            this.slug = finalSlug;
        }
        // Generate path
        if (this.parentId) {
            const parent = yield mongoose_1.default.models.ProductCategory.findById(this.parentId);
            if (parent) {
                this.level = parent.level + 1;
                this.path = `${parent.path}/${this.slug}`;
            }
        }
        else {
            this.level = 0;
            this.path = this.slug;
        }
        next();
    });
});
// Method to get category tree
CategorySchema.statics.getCategoryTree = function () {
    return __awaiter(this, arguments, void 0, function* (parentId = null, maxDepth = 3) {
        const categories = yield this.find({
            parentId,
            isDeleted: false,
            isActive: true,
        }).sort({ displayOrder: 1, title: 1 });
        if (maxDepth <= 0)
            return categories;
        // Note: Recursive call removed due to TypeScript issues
        // Tree building is handled in the controller
        return categories;
    });
};
// Method to get all descendants
CategorySchema.methods.getDescendants = function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.path)
            return [];
        return yield mongoose_1.default.models.ProductCategory.find({
            path: new RegExp(`^${this.path}/`),
            isDeleted: false,
        }).sort({ path: 1 });
    });
};
// Method to get ancestors
CategorySchema.methods.getAncestors = function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.path)
            return [];
        const pathParts = this.path.split("/");
        const ancestorPaths = [];
        for (let i = 1; i < pathParts.length; i++) {
            ancestorPaths.push(pathParts.slice(0, i).join("/"));
        }
        return yield mongoose_1.default.models.ProductCategory.find({
            path: { $in: ancestorPaths },
            isDeleted: false,
        }).sort({ level: 1 });
    });
};
exports.ProductCategory = mongoose_1.default.model("ProductCategory", CategorySchema);
