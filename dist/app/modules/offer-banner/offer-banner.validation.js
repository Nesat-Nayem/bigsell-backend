"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOfferBannerValidation = exports.offerBannerValidation = void 0;
const zod_1 = require("zod");
exports.offerBannerValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    subtitle: zod_1.z.string().min(1, 'Subtitle is required'),
    offer: zod_1.z.string().min(1, 'Offer is required'),
    url: zod_1.z.string().min(1, 'URL is required'),
    image: zod_1.z.string().min(1, 'Image is required'),
});
exports.updateOfferBannerValidation = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    subtitle: zod_1.z.string().min(1).optional(),
    offer: zod_1.z.string().min(1).optional(),
    url: zod_1.z.string().min(1).optional(),
    image: zod_1.z.string().min(1).optional(),
});
