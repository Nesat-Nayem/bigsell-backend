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
exports.About = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AboutUsSchema = new mongoose_1.Schema({
    image: { type: String, default: '' },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    url: { type: String, default: '' },
}, { _id: false });
const CounterSchema = new mongoose_1.Schema({
    happyCustomers: { type: Number, default: 0 },
    electronicsProducts: { type: Number, default: 0 },
    activeSalesman: { type: Number, default: 0 },
    storeWorldwide: { type: Number, default: 0 },
}, { _id: false });
const AboutInfoSchema = new mongoose_1.Schema({
    image: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
}, { _id: false });
const WhyChooseItemSchema = new mongoose_1.Schema({
    image: { type: String, default: '' },
    title: { type: String, default: '' },
    shortDesc: { type: String, default: '' },
}, { _id: false });
const AboutSchema = new mongoose_1.Schema({
    aboutUs: { type: AboutUsSchema, default: {} },
    counter: { type: CounterSchema, default: {} },
    aboutInfo: { type: AboutInfoSchema, default: {} },
    whyChooseUs: { type: [WhyChooseItemSchema], default: [] },
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.createdAt = new Date(ret.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            ret.updatedAt = new Date(ret.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        },
    },
});
exports.About = mongoose_1.default.model('About', AboutSchema);
