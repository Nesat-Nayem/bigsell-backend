"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDiscountOfferValidation = exports.discountOfferValidation = void 0;
const zod_1 = require("zod");
exports.discountOfferValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    offer: zod_1.z.string().min(1, 'Offer is required'),
    image: zod_1.z.string().min(1, 'Image is required'),
});
exports.updateDiscountOfferValidation = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    offer: zod_1.z.string().min(1).optional(),
    image: zod_1.z.string().min(1).optional(),
});
