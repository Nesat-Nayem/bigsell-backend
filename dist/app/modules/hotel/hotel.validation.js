"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hotelUpdateValidation = exports.hotelValidation = void 0;
const zod_1 = require("zod");
const weeklyTimingSchema = zod_1.z.object({
    day: zod_1.z.string().min(1, 'Day is required'),
    hours: zod_1.z.string().min(1, 'Hours are required')
});
const galleryImageSchema = zod_1.z.object({
    url: zod_1.z.string().min(1, 'Image URL is required'),
    alt: zod_1.z.string().min(1, 'Image alt text is required')
});
const coordinatesSchema = zod_1.z.object({
    type: zod_1.z.literal('Point').default('Point'),
    coordinates: zod_1.z.array(zod_1.z.number()).length(2, 'Coordinates must be [longitude, latitude]'),
    address: zod_1.z.string().optional()
}).optional();
const foodOptionSchema = zod_1.z.object({
    label: zod_1.z.string().min(1, 'Option label is required'),
    price: zod_1.z.number().min(0, 'Price must be a positive number')
});
const menuItemSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Item ID is required'),
    title: zod_1.z.string().min(1, 'Item title is required'),
    description: zod_1.z.string().min(1, 'Item description is required'),
    price: zod_1.z.number().min(0, 'Price must be a positive number'),
    category: zod_1.z.string().min(1, 'Item category is required'),
    image: zod_1.z.string().min(1, 'Item image is required'),
    itemType: zod_1.z.array(zod_1.z.string()).optional(),
    attributes: zod_1.z.array(zod_1.z.string()).optional(),
    rating: zod_1.z.number().min(0).max(5).optional(),
    options: zod_1.z.array(foodOptionSchema).optional(),
    sortdesc: zod_1.z.string().optional(),
    offer: zod_1.z.string().optional()
});
const menuCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Category name is required'),
    image: zod_1.z.string().min(1, 'Category image is required'),
    items: zod_1.z.array(menuItemSchema).default([])
});
const reviewSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    rating: zod_1.z.number().min(1).max(5, 'Rating must be between 1 and 5'),
    comment: zod_1.z.string().min(1, 'Comment is required'),
    date: zod_1.z.date().optional()
});
const buffetSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Buffet name is required'),
    type: zod_1.z.string().min(1, 'Buffet type is required'),
    days: zod_1.z.array(zod_1.z.string()).min(1, 'At least one day is required'),
    hours: zod_1.z.string().min(1, 'Hours are required'),
    price: zod_1.z.number().min(0, 'Price must be a positive number')
});
const preBookOfferSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Offer title is required'),
    description: zod_1.z.string().min(1, 'Offer description is required'),
    slots: zod_1.z.string().min(1, 'Slots information is required'),
    buttonText: zod_1.z.string().min(1, 'Button text is required')
});
const walkInOfferSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Offer title is required'),
    description: zod_1.z.string().min(1, 'Offer description is required'),
    validTime: zod_1.z.string().min(1, 'Valid time is required'),
    icon: zod_1.z.string().min(1, 'Icon is required')
});
const bankBenefitSchema = zod_1.z.object({
    bankName: zod_1.z.string().min(1, 'Bank name is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    code: zod_1.z.string().min(1, 'Code is required'),
    bgColor: zod_1.z.string().min(1, 'Background color is required')
});
const featuredInSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    image: zod_1.z.string().min(1, 'Image is required')
});
const aboutInfoSchema = zod_1.z.object({
    established: zod_1.z.string().min(1, 'Established year is required'),
    location: zod_1.z.string().min(1, 'Location is required'),
    priceForTwo: zod_1.z.string().min(1, 'Price for two is required'),
    cuisineTypes: zod_1.z.array(zod_1.z.string()).min(1, 'At least one cuisine type is required'),
    facilities: zod_1.z.array(zod_1.z.string()).min(1, 'At least one facility is required'),
    featuredIn: featuredInSchema
});
exports.hotelValidation = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Hotel name is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    location: zod_1.z.string().min(1, 'Location is required'),
    coordinates: coordinatesSchema,
    distance: zod_1.z.string().min(1, 'Distance is required'),
    cuisine: zod_1.z.string().min(1, 'Cuisine is required'),
    price: zod_1.z.string().min(1, 'Price is required'),
    rating: zod_1.z.number().min(0).max(5, 'Rating must be between 0 and 5').optional(),
    mainImage: zod_1.z.string().min(1, 'Main image is required'),
    galleryImages: zod_1.z.array(galleryImageSchema).optional(),
    offer: zod_1.z.string().optional(),
    weeklyTimings: zod_1.z.array(weeklyTimingSchema).optional(),
    menuCategories: zod_1.z.array(menuCategorySchema).optional(),
    menuItemTypes: zod_1.z.array(zod_1.z.string()).optional(),
    menuAttributes: zod_1.z.array(zod_1.z.string()).optional(),
    reviews: zod_1.z.array(reviewSchema).optional(),
    buffets: zod_1.z.array(buffetSchema).optional(),
    preBookOffers: zod_1.z.array(preBookOfferSchema).optional(),
    walkInOffers: zod_1.z.array(walkInOfferSchema).optional(),
    bankBenefits: zod_1.z.array(bankBenefitSchema).optional(),
    vendorId: zod_1.z.string().min(1, 'Vendor ID is required').optional(),
    aboutInfo: aboutInfoSchema.optional(),
    cgstRate: zod_1.z.number().min(0, 'CGST rate must be non-negative').max(100, 'CGST rate cannot exceed 100').optional(),
    sgstRate: zod_1.z.number().min(0, 'SGST rate must be non-negative').max(100, 'SGST rate cannot exceed 100').optional(),
    serviceCharge: zod_1.z.number().min(0, 'Service charge must be a positive number').optional()
});
exports.hotelUpdateValidation = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Hotel name is required').optional(),
    description: zod_1.z.string().min(1, 'Description is required').optional(),
    location: zod_1.z.string().min(1, 'Location is required').optional(),
    coordinates: coordinatesSchema,
    distance: zod_1.z.string().min(1, 'Distance is required').optional(),
    cuisine: zod_1.z.string().min(1, 'Cuisine is required').optional(),
    price: zod_1.z.string().min(1, 'Price is required').optional(),
    rating: zod_1.z.number().min(0).max(5, 'Rating must be between 0 and 5').optional(),
    mainImage: zod_1.z.string().min(1, 'Main image is required').optional(),
    galleryImages: zod_1.z.array(galleryImageSchema).optional(),
    offer: zod_1.z.string().optional(),
    weeklyTimings: zod_1.z.array(weeklyTimingSchema).optional(),
    menuCategories: zod_1.z.array(menuCategorySchema).optional(),
    menuItemTypes: zod_1.z.array(zod_1.z.string()).optional(),
    menuAttributes: zod_1.z.array(zod_1.z.string()).optional(),
    reviews: zod_1.z.array(reviewSchema).optional(),
    buffets: zod_1.z.array(buffetSchema).optional(),
    preBookOffers: zod_1.z.array(preBookOfferSchema).optional(),
    walkInOffers: zod_1.z.array(walkInOfferSchema).optional(),
    bankBenefits: zod_1.z.array(bankBenefitSchema).optional(),
    vendorId: zod_1.z.string().min(1, 'Vendor ID is required').optional(),
    aboutInfo: aboutInfoSchema.optional(),
    cgstRate: zod_1.z.number().min(0, 'CGST rate must be non-negative').max(100, 'CGST rate cannot exceed 100').optional(),
    sgstRate: zod_1.z.number().min(0, 'SGST rate must be non-negative').max(100, 'SGST rate cannot exceed 100').optional(),
    serviceCharge: zod_1.z.number().min(0, 'Service charge must be a positive number').optional()
});
