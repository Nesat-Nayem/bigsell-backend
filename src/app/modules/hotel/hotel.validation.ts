import { z } from 'zod';

const weeklyTimingSchema = z.object({
  day: z.string().min(1, 'Day is required'),
  hours: z.string().min(1, 'Hours are required')
});

const galleryImageSchema = z.object({
  url: z.string().min(1, 'Image URL is required'),
  alt: z.string().min(1, 'Image alt text is required')
});

const coordinatesSchema = z.object({
  type: z.literal('Point').default('Point'),
  coordinates: z.array(z.number()).length(2, 'Coordinates must be [longitude, latitude]'),
  address: z.string().optional()
}).optional();

const foodOptionSchema = z.object({
  label: z.string().min(1, 'Option label is required'),
  price: z.number().min(0, 'Price must be a positive number')
});



const menuItemSchema = z.object({
  id: z.string().min(1, 'Item ID is required'),
  title: z.string().min(1, 'Item title is required'),
  description: z.string().min(1, 'Item description is required'),
  price: z.number().min(0, 'Price must be a positive number'),
  category: z.string().min(1, 'Item category is required'),
  image: z.string().min(1, 'Item image is required'),
  itemType: z.array(z.string()).optional(),
  attributes: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  options: z.array(foodOptionSchema).optional(),
  sortdesc: z.string().optional(),
  offer: z.string().optional()
});


const menuCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  image: z.string().min(1, 'Category image is required'),
  items: z.array(menuItemSchema).default([])
});

const reviewSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(1, 'Comment is required'),
  date: z.date().optional()
});

const buffetSchema = z.object({
  name: z.string().min(1, 'Buffet name is required'),
  type: z.string().min(1, 'Buffet type is required'),
  days: z.array(z.string()).min(1, 'At least one day is required'),
  hours: z.string().min(1, 'Hours are required'),
  price: z.number().min(0, 'Price must be a positive number')
});

const preBookOfferSchema = z.object({
  title: z.string().min(1, 'Offer title is required'),
  description: z.string().min(1, 'Offer description is required'),
  slots: z.string().min(1, 'Slots information is required'),
  buttonText: z.string().min(1, 'Button text is required')
});

const walkInOfferSchema = z.object({
  title: z.string().min(1, 'Offer title is required'),
  description: z.string().min(1, 'Offer description is required'),
  validTime: z.string().min(1, 'Valid time is required'),
  icon: z.string().min(1, 'Icon is required')
});

const bankBenefitSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  description: z.string().min(1, 'Description is required'),
  code: z.string().min(1, 'Code is required'),
  bgColor: z.string().min(1, 'Background color is required')
});

const featuredInSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  image: z.string().min(1, 'Image is required')
});

const aboutInfoSchema = z.object({
  established: z.string().min(1, 'Established year is required'),
  location: z.string().min(1, 'Location is required'),
  priceForTwo: z.string().min(1, 'Price for two is required'),
  cuisineTypes: z.array(z.string()).min(1, 'At least one cuisine type is required'),
  facilities: z.array(z.string()).min(1, 'At least one facility is required'),
  featuredIn: featuredInSchema
});

export const hotelValidation = z.object({
  name: z.string().min(1, 'Hotel name is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  coordinates: coordinatesSchema,
  distance: z.string().min(1, 'Distance is required'),
  cuisine: z.string().min(1, 'Cuisine is required'),
  price: z.string().min(1, 'Price is required'),
  rating: z.number().min(0).max(5, 'Rating must be between 0 and 5').optional(),
  mainImage: z.string().min(1, 'Main image is required'),
  galleryImages: z.array(galleryImageSchema).optional(),
  offer: z.string().optional(),
  weeklyTimings: z.array(weeklyTimingSchema).optional(),
  menuCategories: z.array(menuCategorySchema).optional(),
  menuItemTypes: z.array(z.string()).optional(),
  menuAttributes: z.array(z.string()).optional(),
  reviews: z.array(reviewSchema).optional(),
  buffets: z.array(buffetSchema).optional(),
  preBookOffers: z.array(preBookOfferSchema).optional(),
  walkInOffers: z.array(walkInOfferSchema).optional(),
  bankBenefits: z.array(bankBenefitSchema).optional(),
  vendorId: z.string().min(1, 'Vendor ID is required').optional(),
  aboutInfo: aboutInfoSchema.optional(),
  cgstRate: z.number().min(0, 'CGST rate must be non-negative').max(100, 'CGST rate cannot exceed 100').optional(),
  sgstRate: z.number().min(0, 'SGST rate must be non-negative').max(100, 'SGST rate cannot exceed 100').optional(),
  serviceCharge: z.number().min(0, 'Service charge must be a positive number').optional()
});

export const hotelUpdateValidation = z.object({
  name: z.string().min(1, 'Hotel name is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  location: z.string().min(1, 'Location is required').optional(),
  coordinates: coordinatesSchema,
  distance: z.string().min(1, 'Distance is required').optional(),
  cuisine: z.string().min(1, 'Cuisine is required').optional(),
  price: z.string().min(1, 'Price is required').optional(),
  rating: z.number().min(0).max(5, 'Rating must be between 0 and 5').optional(),
  mainImage: z.string().min(1, 'Main image is required').optional(),
  galleryImages: z.array(galleryImageSchema).optional(),
  offer: z.string().optional(),
  weeklyTimings: z.array(weeklyTimingSchema).optional(),
  menuCategories: z.array(menuCategorySchema).optional(),
  menuItemTypes: z.array(z.string()).optional(),
  menuAttributes: z.array(z.string()).optional(),
  reviews: z.array(reviewSchema).optional(),
  buffets: z.array(buffetSchema).optional(),
  preBookOffers: z.array(preBookOfferSchema).optional(),
  walkInOffers: z.array(walkInOfferSchema).optional(),
  bankBenefits: z.array(bankBenefitSchema).optional(),
  vendorId: z.string().min(1, 'Vendor ID is required').optional(),
  aboutInfo: aboutInfoSchema.optional(),
  cgstRate: z.number().min(0, 'CGST rate must be non-negative').max(100, 'CGST rate cannot exceed 100').optional(),
  sgstRate: z.number().min(0, 'SGST rate must be non-negative').max(100, 'SGST rate cannot exceed 100').optional(),
  serviceCharge: z.number().min(0, 'Service charge must be a positive number').optional()
});
