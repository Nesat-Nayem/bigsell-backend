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
exports.getHotelsWithDistance = exports.getPlatformActivity = exports.getHotelsForQRCode = exports.updateHotelAboutInfo = exports.getHotelAboutInfo = exports.updateHotelOffers = exports.getHotelOffers = exports.getHotelReviews = exports.addBuffet = exports.deleteFoodItem = exports.getFilterOptions = exports.updateFoodItem = exports.addFoodItem = exports.addMenuCategory = exports.getHotelBuffets = exports.addHotelReview = exports.updateMenuSettings = exports.getMenuSettings = exports.getFoodItemDetails = exports.getMenuItemsByCategory = exports.getHotelMenu = exports.removeGalleryImage = exports.addGalleryImages = exports.getDeletedHotels = exports.restoreHotelById = exports.deleteHotelById = exports.deleteMenuCategory = exports.updateMenuCategory = exports.deleteBuffet = exports.updateBuffet = exports.getVendorHotels = exports.updateHotelById = exports.getHotelById = exports.getAllHotels = exports.createHotel = void 0;
const hotel_model_1 = require("./hotel.model");
const hotel_validation_1 = require("./hotel.validation");
const appError_1 = require("../../errors/appError");
const cloudinary_1 = require("../../config/cloudinary");
const mongoose_1 = __importDefault(require("mongoose"));
const activity_helper_1 = require("../activity/activity.helper");
const createHotel = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { name, description, location, distance, cuisine, price, rating, offer, weeklyTimings, menuCategories, buffets, reviews, cgstRate, sgstRate, serviceCharge, vendorId: vendorIdFromBody } = req.body;
        // Check if hotel with same name already exists
        const existingHotel = yield hotel_model_1.Hotel.findOne({ name, isDeleted: false });
        if (existingHotel) {
            next(new appError_1.appError("Hotel with this name already exists", 400));
            return;
        }
        // If main image is uploaded through multer middleware
        if (!req.file) {
            next(new appError_1.appError("Main image is required", 400));
            return;
        }
        // Get the image URL from req.file
        const mainImage = req.file.path;
        // Parse JSON for arrays if they're sent as strings
        const parsedWeeklyTimings = typeof weeklyTimings === 'string'
            ? JSON.parse(weeklyTimings)
            : weeklyTimings || [];
        const parsedMenuCategories = typeof menuCategories === 'string'
            ? JSON.parse(menuCategories)
            : menuCategories || [];
        const parsedBuffets = typeof buffets === 'string'
            ? JSON.parse(buffets)
            : buffets || [];
        const parsedReviews = typeof reviews === 'string'
            ? JSON.parse(reviews)
            : reviews || [];
        const parsedGalleryImages = req.body.galleryImages
            ? (typeof req.body.galleryImages === 'string'
                ? JSON.parse(req.body.galleryImages)
                : req.body.galleryImages)
            : [];
        // Set the vendorId and rating based on user role
        let vendorId;
        let finalRating;
        if (req.user.role === 'vendor') {
            // For vendors, vendorId is their own ID
            vendorId = req.user._id.toString();
            // Vendors cannot set rating, it defaults to 0
            finalRating = 0;
        }
        else if (req.user.role === 'admin') {
            // For admins, vendorId can be optionally provided in the body
            vendorId = vendorIdFromBody;
            // Admins can set the rating, default to 0 if not provided
            finalRating = rating ? Number(rating) : 0;
        }
        else {
            // Should not happen if auth middleware is correct
            finalRating = 0;
            vendorId = vendorIdFromBody;
        }
        // Validate the input
        const validatedData = hotel_validation_1.hotelValidation.parse({
            name,
            description,
            location,
            distance,
            cuisine,
            price,
            rating: finalRating,
            mainImage,
            galleryImages: parsedGalleryImages,
            offer,
            weeklyTimings: parsedWeeklyTimings,
            menuCategories: parsedMenuCategories,
            buffets: parsedBuffets,
            reviews: parsedReviews,
            vendorId,
            cgstRate: cgstRate ? Number(cgstRate) : undefined,
            sgstRate: sgstRate ? Number(sgstRate) : undefined,
            serviceCharge: serviceCharge ? Number(serviceCharge) : undefined
        });
        // Create a new hotel
        const hotel = new hotel_model_1.Hotel(validatedData);
        yield hotel.save();
        // Log activity
        yield (0, activity_helper_1.logActivity)({
            actorId: req.user._id.toString(),
            actorName: req.user.name || req.user.email || 'Unknown',
            actorRole: req.user.role,
            action: 'create',
            entityType: 'restaurant',
            entityId: hotel._id.toString(),
            entityName: hotel.name,
            description: `Created new restaurant "${hotel.name}" with cuisine "${hotel.cuisine}" at ${hotel.location}`,
            metadata: {
                cuisine: hotel.cuisine,
                location: hotel.location,
                price: hotel.price,
                vendorId: hotel.vendorId
            }
        });
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Hotel created successfully",
            data: hotel,
        });
        return;
    }
    catch (error) {
        // If error during image upload, delete the uploaded image if any
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
            const publicId = (_b = req.file.path.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0];
            if (publicId) {
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-hotels/${publicId}`);
            }
        }
        next(error);
    }
});
exports.createHotel = createHotel;
// Get all hotels
const getAllHotels = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cuisine, search, minRating, sort, minPrice, maxPrice, features, vendorId, page = '1', limit = '10' } = req.query;
        // Build filter object
        const filter = { isDeleted: false };
        // Apply cuisine filter
        if (cuisine) {
            // Convert cuisine_name format to Cuisine Name
            const formattedCuisine = cuisine
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            filter.cuisine = { $regex: formattedCuisine, $options: 'i' };
        }
        // Apply search filter
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { cuisine: { $regex: search, $options: 'i' } }
            ];
        }
        // Apply vendorId filter if provided
        if (vendorId) {
            filter.vendorId = vendorId;
        }
        // Apply rating filter
        if (minRating) {
            filter.rating = { $gte: parseFloat(minRating) };
        }
        // Apply price range filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) {
                filter.price.$gte = parseFloat(minPrice);
            }
            if (maxPrice) {
                filter.price.$lte = parseFloat(maxPrice);
            }
        }
        // Apply features filter
        if (features) {
            const featuresList = features.split(',');
            filter['aboutInfo.facilities'] = { $in: featuresList };
        }
        // Parse pagination parameters
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        // Build sort object
        let sortObj = {};
        if (sort) {
            // const sortField = (sort as string).startsWith('-') 
            //   ? (sort as string).substring(1) 
            //   : sort;
            const sortField = sort.startsWith('-')
                ? sort.substring(1)
                : sort;
            const sortOrder = sort.startsWith('-') ? -1 : 1;
            sortObj = { [sortField]: sortOrder };
        }
        else {
            // Default sort by creation date (newest first)
            sortObj = { createdAt: -1 };
        }
        // Get total count for pagination
        const total = yield hotel_model_1.Hotel.countDocuments(filter);
        // Get hotels with pagination and sorting
        const hotels = yield hotel_model_1.Hotel.find(filter)
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum)
            .select('name description location distance cuisine price rating mainImage offer');
        // Calculate pagination info
        const totalPages = Math.ceil(total / limitNum);
        if (hotels.length === 0) {
            res.status(200).json({
                success: true,
                statusCode: 200,
                message: "No hotels found",
                data: [],
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: totalPages
                }
            });
            return;
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Hotels retrieved successfully",
            data: hotels,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: totalPages
            }
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getAllHotels = getAllHotels;
const getHotelById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: req.params.id,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        // Calculate average rating from reviews
        const avgRating = hotel.reviews.length > 0
            ? (hotel.reviews.reduce((sum, review) => sum + review.rating, 0) / hotel.reviews.length).toFixed(1)
            : hotel.rating.toFixed(1);
        // Format the response to match frontend needs
        const formattedHotel = Object.assign(Object.assign({}, hotel.toObject()), { averageRating: Number(avgRating), totalReviews: hotel.reviews.length, 
            // Get only the 2 most recent reviews
            recentReviews: hotel.reviews.slice(0, 2), 
            // Include offers and about info for tabs
            offers: {
                preBookOffers: hotel.preBookOffers || [],
                walkInOffers: hotel.walkInOffers || [],
                bankBenefits: hotel.bankBenefits || []
            }, aboutInfo: hotel.aboutInfo || null });
        res.json({
            success: true,
            statusCode: 200,
            message: "Hotel retrieved successfully",
            data: formattedHotel,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getHotelById = getHotelById;
const updateHotelById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const hotelId = req.params.id;
        const { name, description, location, distance, cuisine, price, rating, offer, weeklyTimings, menuItems, cgstRate, sgstRate, serviceCharge } = req.body;
        // Find the hotel to update
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: hotelId,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        // Prepare update data
        const updateData = {};
        if (name) {
            // Check if new name already exists
            if (name !== (hotel === null || hotel === void 0 ? void 0 : hotel.name)) {
                const existingHotel = yield hotel_model_1.Hotel.findOne({
                    name,
                    isDeleted: false,
                    _id: { $ne: hotelId }
                });
                if (existingHotel) {
                    next(new appError_1.appError("Hotel with this name already exists", 400));
                    return;
                }
            }
            updateData.name = name;
        }
        // Update basic fields if provided
        if (description)
            updateData.description = description;
        if (location)
            updateData.location = location;
        if (distance)
            updateData.distance = distance;
        if (cuisine)
            updateData.cuisine = cuisine;
        if (price)
            updateData.price = price;
        if (req.user.role === 'admin' && rating) {
            updateData.rating = Number(rating);
        }
        if (offer)
            updateData.offer = offer;
        if (cgstRate !== undefined)
            updateData.cgstRate = Number(cgstRate);
        if (sgstRate !== undefined)
            updateData.sgstRate = Number(sgstRate);
        if (serviceCharge !== undefined)
            updateData.serviceCharge = Number(serviceCharge);
        // Parse and update arrays if provided
        if (weeklyTimings) {
            const parsedWeeklyTimings = typeof weeklyTimings === 'string'
                ? JSON.parse(weeklyTimings)
                : weeklyTimings;
            updateData.weeklyTimings = parsedWeeklyTimings;
        }
        if (menuItems) {
            const parsedMenuItems = typeof menuItems === 'string'
                ? JSON.parse(menuItems)
                : menuItems;
            updateData.menuCategories = parsedMenuItems;
        }
        if (req.body.galleryImages) {
            const parsedGalleryImages = typeof req.body.galleryImages === 'string'
                ? JSON.parse(req.body.galleryImages)
                : req.body.galleryImages;
            updateData.galleryImages = parsedGalleryImages;
        }
        if (req.body.aboutInfo) {
            const parsedAboutInfo = typeof req.body.aboutInfo === 'string'
                ? JSON.parse(req.body.aboutInfo)
                : req.body.aboutInfo;
            updateData.aboutInfo = parsedAboutInfo;
        }
        // If there's a new image
        if (req.file) {
            updateData.mainImage = req.file.path;
            // Delete the old image from cloudinary if it exists
            if (hotel === null || hotel === void 0 ? void 0 : hotel.mainImage) {
                const publicId = (_a = hotel === null || hotel === void 0 ? void 0 : hotel.mainImage.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0];
                if (publicId) {
                    yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-hotels/${publicId}`);
                }
            }
        }
        // Validate the update data
        if (Object.keys(updateData).length > 0) {
            const validatedData = hotel_validation_1.hotelUpdateValidation.parse(updateData);
            // Update the hotel
            const updatedHotel = yield hotel_model_1.Hotel.findByIdAndUpdate(hotelId, validatedData, { new: true });
            // Log activity
            yield (0, activity_helper_1.logActivity)({
                actorId: req.user._id.toString(),
                actorName: req.user.name || req.user.email || 'Unknown',
                actorRole: req.user.role,
                action: 'update',
                entityType: 'restaurant',
                entityId: hotelId,
                entityName: (updatedHotel === null || updatedHotel === void 0 ? void 0 : updatedHotel.name) || (hotel === null || hotel === void 0 ? void 0 : hotel.name) || 'Unknown Restaurant',
                description: `Updated restaurant "${(updatedHotel === null || updatedHotel === void 0 ? void 0 : updatedHotel.name) || (hotel === null || hotel === void 0 ? void 0 : hotel.name)}" - Fields: ${Object.keys(updateData).join(', ')}`,
                metadata: Object.assign({ updatedFields: Object.keys(updateData) }, updateData)
            });
            res.json({
                success: true,
                statusCode: 200,
                message: "Hotel updated successfully",
                data: updatedHotel,
            });
            return;
        }
        // If no updates provided
        res.json({
            success: true,
            statusCode: 200,
            message: "No changes to update",
            data: hotel,
        });
        return;
    }
    catch (error) {
        // If error occurs and image was uploaded, delete it
        if ((_b = req.file) === null || _b === void 0 ? void 0 : _b.path) {
            const publicId = (_c = req.file.path.split('/').pop()) === null || _c === void 0 ? void 0 : _c.split('.')[0];
            if (publicId) {
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-hotels/${publicId}`);
            }
        }
        next(error);
    }
});
exports.updateHotelById = updateHotelById;
// Get hotels for the logged-in vendor
const getVendorHotels = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user is a vendor
        if (req.user.role !== 'vendor') {
            next(new appError_1.appError("Only vendors can access their hotels", 403));
            return;
        }
        const hotels = yield hotel_model_1.Hotel.find({
            vendorId: req.user._id,
            isDeleted: false
        }).select('name description location distance cuisine price rating mainImage offer');
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Vendor hotels retrieved successfully",
            data: hotels
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getVendorHotels = getVendorHotels;
// Update buffet
const updateBuffet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id, buffetId } = req.params;
        const { name, type, days, hours, price } = req.body;
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: id,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        // Find the buffet index
        const buffetIndex = (_a = hotel.buffets) === null || _a === void 0 ? void 0 : _a.findIndex(b => b._id.toString() === buffetId);
        if (buffetIndex === -1 || buffetIndex === undefined || !hotel.buffets) {
            next(new appError_1.appError("Buffet not found", 404));
            return;
        }
        // Parse days if provided as string
        const parsedDays = typeof days === 'string'
            ? JSON.parse(days)
            : days;
        // Update buffet fields
        if (name)
            hotel.buffets[buffetIndex].name = name;
        if (type)
            hotel.buffets[buffetIndex].type = type;
        if (parsedDays)
            hotel.buffets[buffetIndex].days = parsedDays;
        if (hours)
            hotel.buffets[buffetIndex].hours = hours;
        if (price)
            hotel.buffets[buffetIndex].price = Number(price);
        yield hotel.save();
        res.json({
            success: true,
            statusCode: 200,
            message: "Buffet updated successfully",
            data: hotel.buffets[buffetIndex],
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateBuffet = updateBuffet;
// Delete buffet
const deleteBuffet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id, buffetId } = req.params;
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: id,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        // Ensure buffets array exists
        if (!hotel.buffets || hotel.buffets.length === 0) {
            next(new appError_1.appError("No buffets found for this hotel", 404));
            return;
        }
        // Find the buffet index
        const buffetIndex = (_a = hotel.buffets) === null || _a === void 0 ? void 0 : _a.findIndex(b => b._id.toString() === buffetId);
        if (buffetIndex === -1 || buffetIndex === undefined) {
            next(new appError_1.appError("Buffet not found", 404));
            return;
        }
        // Remove the buffet
        hotel.buffets.splice(buffetIndex, 1);
        yield hotel.save();
        res.json({
            success: true,
            statusCode: 200,
            message: "Buffet deleted successfully",
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteBuffet = deleteBuffet;
// Update menu category
const updateMenuCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id, categoryName } = req.params;
        const { name } = req.body;
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: id,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        // Find the category
        const categoryIndex = hotel.menuCategories.findIndex(cat => cat.name.toLowerCase() === decodeURIComponent(categoryName).toLowerCase());
        if (categoryIndex === -1) {
            next(new appError_1.appError("Category not found", 404));
            return;
        }
        // If new name is provided, check if it already exists
        if (name && name !== hotel.menuCategories[categoryIndex].name) {
            const categoryExists = hotel.menuCategories.some(cat => cat.name.toLowerCase() === name.toLowerCase());
            if (categoryExists) {
                next(new appError_1.appError("Category with this name already exists", 400));
                return;
            }
            // Update name
            hotel.menuCategories[categoryIndex].name = name;
        }
        // If new image is provided
        if (req.file) {
            // Delete old image from cloudinary
            const publicId = (_a = hotel.menuCategories[categoryIndex].image.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0];
            if (publicId) {
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-hotels/${publicId}`);
            }
            // Set new image
            hotel.menuCategories[categoryIndex].image = req.file.path;
        }
        yield hotel.save();
        // Log activity
        const updates = [];
        if (name)
            updates.push('name');
        if (req.file)
            updates.push('image');
        yield (0, activity_helper_1.logActivity)({
            actorId: req.user._id.toString(),
            actorName: req.user.name || req.user.email || 'Unknown',
            actorRole: req.user.role,
            action: 'update',
            entityType: 'menu_category',
            entityId: id,
            entityName: `${hotel.name} - ${hotel.menuCategories[categoryIndex].name}`,
            description: `Updated menu category "${hotel.menuCategories[categoryIndex].name}" in restaurant "${hotel.name}" - Fields: ${updates.join(', ')}`,
            metadata: {
                restaurantId: id,
                restaurantName: hotel.name,
                categoryName: hotel.menuCategories[categoryIndex].name,
                updatedFields: updates,
                originalCategoryName: decodeURIComponent(categoryName)
            }
        });
        res.json({
            success: true,
            statusCode: 200,
            message: "Menu category updated successfully",
            data: hotel.menuCategories[categoryIndex],
        });
    }
    catch (error) {
        // If error during image upload, delete the uploaded image if any
        if ((_b = req.file) === null || _b === void 0 ? void 0 : _b.path) {
            const publicId = (_c = req.file.path.split('/').pop()) === null || _c === void 0 ? void 0 : _c.split('.')[0];
            if (publicId) {
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-hotels/${publicId}`);
            }
        }
        next(error);
    }
});
exports.updateMenuCategory = updateMenuCategory;
// Delete menu category
const deleteMenuCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id, categoryName } = req.params;
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: id,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        // Find the category
        const categoryIndex = hotel.menuCategories.findIndex(cat => cat.name.toLowerCase() === decodeURIComponent(categoryName).toLowerCase());
        if (categoryIndex === -1) {
            next(new appError_1.appError("Category not found", 404));
            return;
        }
        const categoryToDelete = hotel.menuCategories[categoryIndex];
        // Delete category image from cloudinary
        const publicId = (_a = hotel.menuCategories[categoryIndex].image.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0];
        if (publicId) {
            yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-hotels/${publicId}`);
        }
        // Delete all food item images in this category
        for (const item of hotel.menuCategories[categoryIndex].items) {
            const itemPublicId = (_b = item.image.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0];
            if (itemPublicId) {
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-hotels/${itemPublicId}`);
            }
        }
        // Remove the category
        hotel.menuCategories.splice(categoryIndex, 1);
        yield hotel.save();
        // Log activity
        yield (0, activity_helper_1.logActivity)({
            actorId: req.user._id.toString(),
            actorName: req.user.name || req.user.email || 'Unknown',
            actorRole: req.user.role,
            action: 'delete',
            entityType: 'menu_category',
            entityId: id,
            entityName: `${hotel.name} - ${categoryToDelete.name}`,
            description: `Deleted menu category "${categoryToDelete.name}" from restaurant "${hotel.name}" (including ${categoryToDelete.items.length} food items)`,
            metadata: {
                restaurantId: id,
                restaurantName: hotel.name,
                categoryName: categoryToDelete.name,
                deletedItemsCount: categoryToDelete.items.length
            }
        });
        res.json({
            success: true,
            statusCode: 200,
            message: "Menu category deleted successfully",
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteMenuCategory = deleteMenuCategory;
const deleteHotelById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotel = yield hotel_model_1.Hotel.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        // Log activity
        yield (0, activity_helper_1.logActivity)({
            actorId: req.user._id.toString(),
            actorName: req.user.name || req.user.email || 'Unknown',
            actorRole: req.user.role,
            action: 'delete',
            entityType: 'restaurant',
            entityId: req.params.id,
            entityName: hotel.name,
            description: `Deleted restaurant "${hotel.name}" from ${hotel.location}`,
            metadata: {
                cuisine: hotel.cuisine,
                location: hotel.location,
                vendorId: hotel.vendorId
            }
        });
        res.json({
            success: true,
            statusCode: 200,
            message: "Hotel deleted successfully",
            data: hotel,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteHotelById = deleteHotelById;
// Restore a soft-deleted hotel
const restoreHotelById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotel = yield hotel_model_1.Hotel.findOneAndUpdate({ _id: req.params.id, isDeleted: true }, { isDeleted: false }, { new: true });
        if (!hotel) {
            next(new appError_1.appError("Deleted hotel not found", 404));
            return;
        }
        // Log activity
        yield (0, activity_helper_1.logActivity)({
            actorId: req.user._id.toString(),
            actorName: req.user.name || req.user.email || 'Unknown',
            actorRole: req.user.role,
            action: 'restore',
            entityType: 'restaurant',
            entityId: req.params.id,
            entityName: hotel.name,
            description: `Restored restaurant "${hotel.name}" from ${hotel.location}`,
            metadata: {
                cuisine: hotel.cuisine,
                location: hotel.location,
                vendorId: hotel.vendorId
            }
        });
        res.json({
            success: true,
            statusCode: 200,
            message: "Hotel restored successfully",
            data: hotel,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.restoreHotelById = restoreHotelById;
// Get all deleted hotels for restore purposes (admin only)
const getDeletedHotels = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const vendorId = req.query.vendorId;
        // Build query for deleted hotels
        const query = { isDeleted: true };
        // Add search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
                { cuisine: { $regex: search, $options: 'i' } }
            ];
        }
        // If vendorId is provided, filter by vendor
        if (vendorId) {
            query.vendorId = vendorId;
        }
        const skip = (page - 1) * limit;
        const [hotels, total] = yield Promise.all([
            hotel_model_1.Hotel.find(query)
                .populate('vendorId', 'name email')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            hotel_model_1.Hotel.countDocuments(query)
        ]);
        const pagination = {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        };
        res.json({
            success: true,
            statusCode: 200,
            message: "Deleted hotels retrieved successfully",
            data: {
                hotels,
                pagination
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getDeletedHotels = getDeletedHotels;
// Add gallery images to hotel
const addGalleryImages = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotelId = req.params.id;
        // Find the hotel to update
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: hotelId,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        // Check if files were uploaded
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            next(new appError_1.appError("No images uploaded", 400));
            return;
        }
        // Get image URLs from req.files
        const newGalleryImages = req.files.map(file => ({
            url: file.path,
            alt: req.body.alt || 'Hotel gallery image'
        }));
        // Update hotel with new gallery images
        hotel.galleryImages = [...hotel.galleryImages, ...newGalleryImages];
        yield hotel.save();
        res.json({
            success: true,
            statusCode: 200,
            message: "Gallery images added successfully",
            data: hotel,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.addGalleryImages = addGalleryImages;
// Remove gallery image from hotel
const removeGalleryImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { hotelId, imageUrl } = req.params;
        // Find the hotel to update
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: hotelId,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        // Find the image in gallery
        const imageIndex = hotel.galleryImages.findIndex(img => img.url === decodeURIComponent(imageUrl));
        if (imageIndex === -1) {
            next(new appError_1.appError("Image not found in gallery", 404));
            return;
        }
        // Remove the image from cloudinary
        const publicId = (_a = decodeURIComponent(imageUrl).split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0];
        if (publicId) {
            yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-hotels/${publicId}`);
        }
        // Remove the image from gallery
        hotel.galleryImages.splice(imageIndex, 1);
        yield hotel.save();
        res.json({
            success: true,
            statusCode: 200,
            message: "Gallery image removed successfully",
            data: hotel,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.removeGalleryImage = removeGalleryImage;
// Get menu categories for a hotel
const getHotelMenu = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: req.params.id,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Menu categories retrieved successfully",
            data: hotel.menuCategories,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getHotelMenu = getHotelMenu;
// Get menu items by category
const getMenuItemsByCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, categoryName } = req.params;
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: id,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        const category = hotel.menuCategories.find(cat => cat.name.toLowerCase() === decodeURIComponent(categoryName).toLowerCase());
        if (!category) {
            next(new appError_1.appError("Category not found", 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Menu items retrieved successfully",
            data: category.items,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getMenuItemsByCategory = getMenuItemsByCategory;
// Get food item details
const getFoodItemDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, foodId } = req.params;
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: id,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        // Find the food item in any category
        let foodItem = null;
        for (const category of hotel.menuCategories) {
            const item = category.items.find(item => item.id === foodId);
            if (item) {
                foodItem = item;
                break;
            }
        }
        if (!foodItem) {
            next(new appError_1.appError("Food item not found", 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Food item retrieved successfully",
            data: foodItem,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getFoodItemDetails = getFoodItemDetails;
// Get menu settings
const getMenuSettings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: req.params.id,
            isDeleted: false
        }).select('menuItemTypes menuAttributes');
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Menu settings retrieved successfully",
            data: {
                itemTypes: hotel.menuItemTypes,
                attributes: hotel.menuAttributes,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getMenuSettings = getMenuSettings;
// Update menu settings
const updateMenuSettings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { itemTypes, attributes } = req.body;
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: id,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        if (itemTypes) {
            hotel.menuItemTypes = itemTypes;
        }
        if (attributes) {
            hotel.menuAttributes = attributes;
        }
        yield hotel.save();
        res.json({
            success: true,
            statusCode: 200,
            message: "Menu settings updated successfully",
            data: {
                itemTypes: hotel.menuItemTypes,
                attributes: hotel.menuAttributes,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateMenuSettings = updateMenuSettings;
// Add a review to a hotel
const addHotelReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, rating, comment } = req.body;
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: id,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        // Validate review data
        const reviewData = {
            name,
            rating: Number(rating),
            comment,
            date: new Date()
        };
        // Add review to hotel
        hotel.reviews.unshift(reviewData);
        yield hotel.save();
        // Recalculate average rating
        const totalRating = hotel.reviews.reduce((sum, review) => sum + review.rating, 0);
        hotel.rating = parseFloat((totalRating / hotel.reviews.length).toFixed(1));
        yield hotel.save();
        res.json({
            success: true,
            statusCode: 200,
            message: "Review added successfully",
            data: hotel.reviews,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.addHotelReview = addHotelReview;
// Get buffets for a hotel
const getHotelBuffets = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: req.params.id,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Buffets retrieved successfully",
            data: hotel.buffets || [],
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getHotelBuffets = getHotelBuffets;
// Add a new menu category
const addMenuCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: id,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        // Check if category already exists
        const categoryExists = hotel.menuCategories.some(cat => cat.name.toLowerCase() === name.toLowerCase());
        if (categoryExists) {
            next(new appError_1.appError("Category already exists", 400));
            return;
        }
        // Check if image was uploaded
        if (!req.file) {
            next(new appError_1.appError("Category image is required", 400));
            return;
        }
        // Create new category
        const newCategory = {
            name,
            image: req.file.path,
            items: []
        };
        // Add category to hotel
        hotel.menuCategories.push(newCategory);
        yield hotel.save();
        // Log activity
        yield (0, activity_helper_1.logActivity)({
            actorId: req.user._id.toString(),
            actorName: req.user.name || req.user.email || 'Unknown',
            actorRole: req.user.role,
            action: 'create',
            entityType: 'menu_category',
            entityId: id,
            entityName: `${hotel.name} - ${name}`,
            description: `Added new menu category "${name}" to restaurant "${hotel.name}"`,
            metadata: {
                restaurantId: id,
                restaurantName: hotel.name,
                categoryName: name,
                categoryImage: req.file.path
            }
        });
        res.json({
            success: true,
            statusCode: 200,
            message: "Menu category added successfully",
            data: hotel.menuCategories,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.addMenuCategory = addMenuCategory;
// Add a food item to a category
const addFoodItem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id, categoryName } = req.params;
        const { title, description, price, options, sortdesc, offer, itemType, attributes } = req.body;
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: id,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        // Find the category
        const categoryIndex = hotel.menuCategories.findIndex(cat => cat.name.toLowerCase() === decodeURIComponent(categoryName).toLowerCase());
        if (categoryIndex === -1) {
            next(new appError_1.appError("Category not found", 404));
            return;
        }
        // Check if image was uploaded
        if (!req.file) {
            next(new appError_1.appError("Food item image is required", 400));
            return;
        }
        // Parse options if provided as string
        const parsedOptions = typeof options === 'string'
            ? JSON.parse(options)
            : options || [];
        const parsedItemType = typeof itemType === 'string'
            ? JSON.parse(itemType)
            : itemType || [];
        const parsedAttributes = typeof attributes === 'string'
            ? JSON.parse(attributes)
            : attributes || [];
        // Create unique ID for the food item
        const foodId = new mongoose_1.default.Types.ObjectId().toString();
        // Create new food item
        const newFoodItem = {
            id: foodId,
            title,
            description,
            price: Number(price),
            category: categoryName,
            image: req.file.path,
            itemType: parsedItemType,
            attributes: parsedAttributes,
            options: parsedOptions,
            sortdesc: sortdesc || `${title} · ₹${price}`,
            offer: offer || ""
        };
        // Add food item to category
        hotel.menuCategories[categoryIndex].items.push(newFoodItem);
        yield hotel.save();
        // Log activity
        yield (0, activity_helper_1.logActivity)({
            actorId: req.user._id.toString(),
            actorName: req.user.name || req.user.email || 'Unknown',
            actorRole: req.user.role,
            action: 'create',
            entityType: 'menu_item',
            entityId: foodId,
            entityName: `${hotel.name} - ${categoryName} - ${title}`,
            description: `Added new food item "${title}" to category "${categoryName}" in restaurant "${hotel.name}"`,
            metadata: {
                restaurantId: id,
                restaurantName: hotel.name,
                categoryName: decodeURIComponent(categoryName),
                foodItemId: foodId,
                foodItemTitle: title,
                price: Number(price),
                offer: offer || ''
            }
        });
        res.json({
            success: true,
            statusCode: 201,
            message: "Food item added successfully",
            data: newFoodItem,
        });
    }
    catch (error) {
        // If error during image upload, delete the uploaded image if any
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
            const publicId = (_b = req.file.path.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0];
            if (publicId) {
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-hotels/${publicId}`);
            }
        }
        next(error);
    }
});
exports.addFoodItem = addFoodItem;
// Update a food item
const updateFoodItem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id, foodId } = req.params;
        const { title, description, price, options, sortdesc, offer, itemType, attributes } = req.body;
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: id,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        // Find the food item in any category
        let categoryIndex = -1;
        let itemIndex = -1;
        for (let i = 0; i < hotel.menuCategories.length; i++) {
            const index = hotel.menuCategories[i].items.findIndex(item => item.id === foodId);
            if (index !== -1) {
                categoryIndex = i;
                itemIndex = index;
                break;
            }
        }
        if (categoryIndex === -1 || itemIndex === -1) {
            next(new appError_1.appError("Food item not found", 404));
            return;
        }
        // Get the current food item
        const foodItem = hotel.menuCategories[categoryIndex].items[itemIndex];
        // Parse options if provided as string
        const parsedOptions = typeof options === 'string'
            ? JSON.parse(options)
            : options;
        const parsedItemType = typeof itemType === 'string'
            ? JSON.parse(itemType)
            : itemType;
        const parsedAttributes = typeof attributes === 'string'
            ? JSON.parse(attributes)
            : attributes;
        // Update food item fields
        if (title)
            foodItem.title = title;
        if (description)
            foodItem.description = description;
        if (price)
            foodItem.price = Number(price);
        if (parsedItemType)
            foodItem.itemType = parsedItemType;
        if (parsedAttributes)
            foodItem.attributes = parsedAttributes;
        if (parsedOptions)
            foodItem.options = parsedOptions;
        // Update new fields
        if (sortdesc)
            foodItem.sortdesc = sortdesc;
        if (offer)
            foodItem.offer = offer;
        // If title or price changed but sortdesc wasn't provided, update the default sortdesc
        if ((title || price) && !sortdesc) {
            foodItem.sortdesc = `${foodItem.title} · ₹${foodItem.price}`;
        }
        // Update image if provided
        if (req.file) {
            // Delete old image from cloudinary
            const publicId = (_a = foodItem.image.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0];
            if (publicId) {
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-hotels/${publicId}`);
            }
            // Set new image
            foodItem.image = req.file.path;
        }
        yield hotel.save();
        res.json({
            success: true,
            statusCode: 200,
            message: "Food item updated successfully",
            data: foodItem,
        });
    }
    catch (error) {
        // If error during image upload, delete the uploaded image if any
        if ((_b = req.file) === null || _b === void 0 ? void 0 : _b.path) {
            const publicId = (_c = req.file.path.split('/').pop()) === null || _c === void 0 ? void 0 : _c.split('.')[0];
            if (publicId) {
                yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-hotels/${publicId}`);
            }
        }
        next(error);
    }
});
exports.updateFoodItem = updateFoodItem;
// Get filter options
const getFilterOptions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get unique cuisines from all hotels
        const cuisines = yield hotel_model_1.Hotel.distinct('cuisine', { isDeleted: false });
        // Create filter options structure
        const filterOptions = [
            {
                title: "Sort by",
                options: [
                    { id: "relevance", label: "Relevance" },
                    { id: "rating_high_to_low", label: "Rating: High to Low" },
                    { id: "cost_low_to_high", label: "Cost: Low to High" },
                    { id: "cost_high_to_low", label: "Cost: High to Low" },
                    { id: "distance_near_to_far", label: "Distance: Near to Far" },
                ],
                type: "radio",
                filterType: "sort"
            },
            {
                title: "Cuisines",
                options: cuisines.map(cuisine => ({
                    id: cuisine.toLowerCase().replace(/\s+/g, '_'),
                    label: cuisine
                })),
                type: "checkbox",
                filterType: "cuisine"
            },
            {
                title: "Rating",
                options: [
                    { id: "4.5", label: "4.5 above" },
                    { id: "4.0", label: "4.0 above" },
                    { id: "3.5", label: "3.5 above" },
                    { id: "3.0", label: "3.0 above" },
                ],
                type: "radio",
                filterType: "rating"
            },
            {
                title: "Cost for two",
                options: [
                    { id: "2500_plus", label: "₹ 2,500 - Any" },
                    { id: "2000_2500", label: "₹ 2,000 - ₹ 2,500" },
                    { id: "1500_2000", label: "₹ 1,500 - ₹ 2,000" },
                    { id: "1000_1500", label: "₹ 1,000 - ₹ 1,500" },
                    { id: "500_1000", label: "₹ 500 - ₹ 1,000" },
                    { id: "0_500", label: "Less than ₹ 500" },
                ],
                type: "checkbox",
                filterType: "price"
            },
        ];
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Filter options retrieved successfully",
            data: filterOptions
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getFilterOptions = getFilterOptions;
// Delete a food item
const deleteFoodItem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id, foodId } = req.params;
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: id,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        // Find the food item in any category
        let categoryIndex = -1;
        let itemIndex = -1;
        let foodItem = null;
        for (let i = 0; i < hotel.menuCategories.length; i++) {
            const index = hotel.menuCategories[i].items.findIndex(item => item.id === foodId);
            if (index !== -1) {
                categoryIndex = i;
                itemIndex = index;
                foodItem = hotel.menuCategories[i].items[index];
                break;
            }
        }
        if (categoryIndex === -1 || itemIndex === -1 || !foodItem) {
            next(new appError_1.appError("Food item not found", 404));
            return;
        }
        // Delete image from cloudinary
        const publicId = (_a = foodItem.image.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0];
        if (publicId) {
            yield cloudinary_1.cloudinary.uploader.destroy(`restaurant-hotels/${publicId}`);
        }
        // Remove the food item from the category
        hotel.menuCategories[categoryIndex].items.splice(itemIndex, 1);
        yield hotel.save();
        res.json({
            success: true,
            statusCode: 200,
            message: "Food item deleted successfully",
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteFoodItem = deleteFoodItem;
// Add buffet to hotel
const addBuffet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, type, days, hours, price } = req.body;
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: id,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        // Parse days if provided as string
        const parsedDays = typeof days === 'string'
            ? JSON.parse(days)
            : days;
        // Create new buffet
        const newBuffet = {
            name,
            type,
            days: parsedDays,
            hours,
            price: Number(price)
        };
        // Add buffet to hotel
        if (!hotel.buffets) {
            hotel.buffets = [];
        }
        hotel.buffets.push(newBuffet);
        yield hotel.save();
        // Log activity
        yield (0, activity_helper_1.logActivity)({
            actorId: req.user._id.toString(),
            actorName: req.user.name || req.user.email || 'Unknown',
            actorRole: req.user.role,
            action: 'create',
            entityType: 'buffet',
            entityId: id,
            entityName: `${hotel.name} - ${name}`,
            description: `Added new buffet "${name}" (${type}) to restaurant "${hotel.name}"`,
            metadata: {
                restaurantId: id,
                restaurantName: hotel.name,
                buffetName: name,
                buffetType: type,
                price: Number(price),
                days: parsedDays,
                hours
            }
        });
        res.json({
            success: true,
            statusCode: 201,
            message: "Buffet added successfully",
            data: hotel.buffets,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.addBuffet = addBuffet;
// Get hotel reviews
const getHotelReviews = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: id,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        // Calculate pagination
        const startIndex = (Number(page) - 1) * Number(limit);
        const endIndex = startIndex + Number(limit);
        // Get paginated reviews
        const paginatedReviews = hotel.reviews.slice(startIndex, endIndex);
        // Calculate average rating
        const avgRating = hotel.reviews.length > 0
            ? (hotel.reviews.reduce((sum, review) => sum + review.rating, 0) / hotel.reviews.length).toFixed(1)
            : 0;
        res.json({
            success: true,
            statusCode: 200,
            message: "Reviews retrieved successfully",
            data: {
                reviews: paginatedReviews,
                totalReviews: hotel.reviews.length,
                averageRating: Number(avgRating),
                pagination: {
                    total: hotel.reviews.length,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(hotel.reviews.length / Number(limit))
                }
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getHotelReviews = getHotelReviews;
// Get hotel offers
const getHotelOffers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: req.params.id,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        const offers = {
            preBookOffers: hotel.preBookOffers || [],
            walkInOffers: hotel.walkInOffers || [],
            bankBenefits: hotel.bankBenefits || []
        };
        res.json({
            success: true,
            statusCode: 200,
            message: "Hotel offers retrieved successfully",
            data: offers,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getHotelOffers = getHotelOffers;
// Update hotel offers
const updateHotelOffers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const { preBookOffers, walkInOffers, bankBenefits } = req.body;
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: id,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        // Parse JSON for arrays if they're sent as strings
        const parsedPreBookOffers = typeof preBookOffers === 'string'
            ? JSON.parse(preBookOffers)
            : preBookOffers;
        const parsedWalkInOffers = typeof walkInOffers === 'string'
            ? JSON.parse(walkInOffers)
            : walkInOffers;
        const parsedBankBenefits = typeof bankBenefits === 'string'
            ? JSON.parse(bankBenefits)
            : bankBenefits;
        // Track what was updated
        const updatedOffers = [];
        if (parsedPreBookOffers) {
            hotel.preBookOffers = parsedPreBookOffers;
            updatedOffers.push('Pre-book Offers');
        }
        if (parsedWalkInOffers) {
            hotel.walkInOffers = parsedWalkInOffers;
            updatedOffers.push('Walk-in Offers');
        }
        if (parsedBankBenefits) {
            hotel.bankBenefits = parsedBankBenefits;
            updatedOffers.push('Bank Benefits');
        }
        yield hotel.save();
        // Log activity
        if (updatedOffers.length > 0) {
            yield (0, activity_helper_1.logActivity)({
                actorId: req.user._id.toString(),
                actorName: req.user.name || req.user.email || 'Unknown',
                actorRole: req.user.role,
                action: 'update',
                entityType: 'offer',
                entityId: id,
                entityName: `${hotel.name} - Offers`,
                description: `Updated offers for restaurant "${hotel.name}" - ${updatedOffers.join(', ')}`,
                metadata: {
                    restaurantId: id,
                    restaurantName: hotel.name,
                    updatedOffers,
                    preBookOffersCount: ((_a = hotel.preBookOffers) === null || _a === void 0 ? void 0 : _a.length) || 0,
                    walkInOffersCount: ((_b = hotel.walkInOffers) === null || _b === void 0 ? void 0 : _b.length) || 0,
                    bankBenefitsCount: ((_c = hotel.bankBenefits) === null || _c === void 0 ? void 0 : _c.length) || 0
                }
            });
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Hotel offers updated successfully",
            data: {
                preBookOffers: hotel.preBookOffers,
                walkInOffers: hotel.walkInOffers,
                bankBenefits: hotel.bankBenefits
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateHotelOffers = updateHotelOffers;
// Get hotel about information
const getHotelAboutInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: req.params.id,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Hotel about information retrieved successfully",
            data: hotel.aboutInfo || null,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getHotelAboutInfo = getHotelAboutInfo;
// Update hotel about information
const updateHotelAboutInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { aboutInfo } = req.body;
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: id,
            isDeleted: false
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        // Parse JSON if it's sent as a string
        const parsedAboutInfo = typeof aboutInfo === 'string'
            ? JSON.parse(aboutInfo)
            : aboutInfo;
        // Update about information
        hotel.aboutInfo = parsedAboutInfo;
        yield hotel.save();
        // Log activity
        yield (0, activity_helper_1.logActivity)({
            actorId: req.user._id.toString(),
            actorName: req.user.name || req.user.email || 'Unknown',
            actorRole: req.user.role,
            action: 'update',
            entityType: 'about_info',
            entityId: id,
            entityName: `${hotel.name} - About Info`,
            description: `Updated about information for restaurant "${hotel.name}"`,
            metadata: {
                restaurantId: id,
                restaurantName: hotel.name,
                aboutInfo: parsedAboutInfo
            }
        });
        res.json({
            success: true,
            statusCode: 200,
            message: "Hotel about information updated successfully",
            data: hotel.aboutInfo,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateHotelAboutInfo = updateHotelAboutInfo;
// Get hotels list for QR code selection (admin only)
const getHotelsForQRCode = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotels = yield hotel_model_1.Hotel.find({ isDeleted: false })
            .select('_id name location')
            .sort({ name: 1 });
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Hotels list retrieved successfully",
            data: hotels
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getHotelsForQRCode = getHotelsForQRCode;
// Get platform activity for admin dashboard
const getPlatformActivity = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Get all hotels (not deleted)
        const hotels = yield hotel_model_1.Hotel.find({ isDeleted: false })
            .populate('vendorId', 'name phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const totalCount = yield hotel_model_1.Hotel.countDocuments({ isDeleted: false });
        const totalPages = Math.ceil(totalCount / limit);
        // Transform hotels into activity format
        const activities = hotels.map((hotel) => {
            var _a, _b, _c, _d, _e;
            return ({
                id: (_a = hotel._id) === null || _a === void 0 ? void 0 : _a.toString(),
                type: 'created',
                message: `New restaurant "${hotel.name}" was added to the platform`,
                actor: {
                    name: ((_b = hotel.vendorId) === null || _b === void 0 ? void 0 : _b.name) || 'Unknown Vendor',
                    phone: ((_c = hotel.vendorId) === null || _c === void 0 ? void 0 : _c.phone) || 'N/A',
                    id: (_d = hotel.vendorId) === null || _d === void 0 ? void 0 : _d.toString(),
                },
                target: {
                    type: 'restaurant',
                    name: hotel.name,
                    id: (_e = hotel._id) === null || _e === void 0 ? void 0 : _e.toString(),
                    location: hotel.location,
                    cuisine: hotel.cuisine,
                    rating: hotel.rating || 0,
                    image: hotel.mainImage,
                },
                timestamp: hotel.createdAt,
                icon: 'restaurant',
                color: 'green',
            });
        });
        // Get stats
        const stats = {
            totalRestaurants: yield hotel_model_1.Hotel.countDocuments({ isDeleted: false }),
            activeRestaurants: yield hotel_model_1.Hotel.countDocuments({ isDeleted: false }),
            deletedRestaurants: yield hotel_model_1.Hotel.countDocuments({ isDeleted: true }),
            todayAdded: yield hotel_model_1.Hotel.countDocuments({
                isDeleted: false,
                createdAt: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    $lt: new Date(new Date().setHours(23, 59, 59, 999)),
                },
            }),
        };
        const response = {
            activities,
            stats,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Platform activity retrieved successfully',
            data: response,
        });
    }
    catch (error) {
        next(new appError_1.appError(error.message, 500));
    }
});
exports.getPlatformActivity = getPlatformActivity;
// Get hotels with calculated distances from user location
const getHotelsWithDistance = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userLat, userLng, page = 1, limit = 10, maxDistance = 50000 } = req.query; // maxDistance in meters (default 50km)
        if (!userLat || !userLng) {
            next(new appError_1.appError('User latitude and longitude are required', 400));
            return;
        }
        const userLatNum = parseFloat(userLat);
        const userLngNum = parseFloat(userLng);
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const maxDistanceNum = parseInt(maxDistance);
        // Find hotels with coordinates and calculate distance
        const hotelsWithCoordinates = yield hotel_model_1.Hotel.find({
            isDeleted: false,
            'coordinates.coordinates': { $exists: true, $ne: [] }
        });
        // If no hotels have coordinates, return hotels without distance calculation
        if (hotelsWithCoordinates.length === 0) {
            const hotelsWithoutCoords = yield hotel_model_1.Hotel.find({ isDeleted: false })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .sort({ rating: -1 });
            const totalCount = yield hotel_model_1.Hotel.countDocuments({ isDeleted: false });
            res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Hotels retrieved successfully (no location data available)',
                data: {
                    hotels: hotelsWithoutCoords,
                    pagination: {
                        currentPage: pageNum,
                        totalPages: Math.ceil(totalCount / limitNum),
                        totalCount,
                        hasNext: pageNum < Math.ceil(totalCount / limitNum),
                        hasPrev: pageNum > 1,
                    },
                    userLocation: {
                        lat: userLatNum,
                        lng: userLngNum
                    }
                }
            });
            return;
        }
        // Use MongoDB's geospatial query to find nearby hotels
        const nearbyHotels = yield hotel_model_1.Hotel.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [userLngNum, userLatNum] // Note: MongoDB uses [lng, lat]
                    },
                    distanceField: "calculatedDistance",
                    maxDistance: maxDistanceNum,
                    spherical: true,
                    query: { isDeleted: false }
                }
            },
            {
                $addFields: {
                    distanceInKm: {
                        $round: [{ $divide: ["$calculatedDistance", 1000] }, 2]
                    },
                    distanceText: {
                        $concat: [
                            { $toString: { $round: [{ $divide: ["$calculatedDistance", 1000] }, 1] } },
                            " km"
                        ]
                    }
                }
            },
            {
                $skip: (pageNum - 1) * limitNum
            },
            {
                $limit: limitNum
            }
        ]);
        // Get total count for pagination
        const totalCount = yield hotel_model_1.Hotel.countDocuments({
            isDeleted: false,
            'coordinates.coordinates': { $exists: true, $ne: [] }
        });
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Hotels with distances retrieved successfully',
            data: {
                hotels: nearbyHotels,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalCount / limitNum),
                    totalCount,
                    hasNext: pageNum < Math.ceil(totalCount / limitNum),
                    hasPrev: pageNum > 1,
                },
                userLocation: {
                    lat: userLatNum,
                    lng: userLngNum
                }
            }
        });
    }
    catch (error) {
        next(new appError_1.appError(error.message, 500));
    }
});
exports.getHotelsWithDistance = getHotelsWithDistance;
