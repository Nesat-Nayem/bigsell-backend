"use strict";
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
const mongoose_1 = __importDefault(require("mongoose"));
const product_category_model_1 = require("../app/modules/Product-category/product-category.model");
const config_1 = __importDefault(require("../app/config"));
function generateSlug(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.connect(config_1.default.database_url);
        console.log('Connected to DB');
    });
}
function fixCategoryPaths() {
    return __awaiter(this, void 0, void 0, function* () {
        // Load all categories (not lean; we will save)
        const categories = yield product_category_model_1.ProductCategory.find({ isDeleted: false });
        console.log(`Loaded ${categories.length} categories`);
        // Build map and children adjacency
        const byId = new Map();
        const childrenMap = new Map();
        categories.forEach((doc) => {
            byId.set(String(doc._id), doc);
            const p = doc.parentId ? String(doc.parentId) : null;
            if (!childrenMap.has(p))
                childrenMap.set(p, []);
            childrenMap.get(p).push(doc);
        });
        // Queue roots (parentId null or parent not found)
        const roots = [];
        for (const doc of categories) {
            const pid = doc.parentId ? String(doc.parentId) : null;
            if (!pid || !byId.has(pid)) {
                roots.push(doc);
            }
        }
        let updated = 0;
        // BFS from roots
        const queue = [];
        roots.forEach((root) => queue.push({ node: root, parent: null }));
        const visited = new Set();
        while (queue.length > 0) {
            const { node, parent } = queue.shift();
            const id = String(node._id);
            if (visited.has(id))
                continue; // prevent cycles
            visited.add(id);
            // Ensure slug exists
            if (!node.slug || typeof node.slug !== 'string' || !node.slug.trim()) {
                node.slug = generateSlug(node.title || 'category');
            }
            // Compute level & path
            const oldLevel = node.level;
            const oldPath = node.path;
            if (!parent) {
                node.level = 0;
                node.path = node.slug;
            }
            else {
                node.level = (parent.level || 0) + 1;
                node.path = `${parent.path}/${node.slug}`;
            }
            if (node.level !== oldLevel || node.path !== oldPath) {
                yield node.save();
                updated++;
                console.log(`Updated ${node.title} -> level: ${node.level}, path: ${node.path}`);
            }
            // Enqueue children
            const childList = childrenMap.get(id) || [];
            childList.forEach((child) => queue.push({ node: child, parent: node }));
        }
        console.log(`Done. Updated ${updated} categories.`);
    });
}
(function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield connectDB();
            yield fixCategoryPaths();
        }
        catch (err) {
            console.error('Error fixing category paths:', err);
            process.exitCode = 1;
        }
        finally {
            yield mongoose_1.default.disconnect();
            console.log('Disconnected from DB');
        }
    });
})();
