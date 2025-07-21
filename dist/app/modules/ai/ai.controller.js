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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHotelMenuChat = exports.getAIFoodSuggestions = exports.generateGenericText = exports.generateDocumentController = exports.improveDescriptionController = exports.generateDescriptionController = void 0;
const aiService_1 = require("../../services/aiService");
const appError_1 = require("../../errors/appError");
const hotel_model_1 = require("../hotel/hotel.model");
const generateDescriptionController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, context } = req.body;
        if (!name || typeof name !== 'string') {
            next(new appError_1.appError('Name is required', 400));
            return;
        }
        if (!context || typeof context !== 'string') {
            next(new appError_1.appError('Context is required', 400));
            return;
        }
        const description = yield aiService_1.aiService.generateDescription(name, context);
        res.json({
            success: true,
            statusCode: 200,
            message: 'Description generated successfully',
            data: { description },
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.generateDescriptionController = generateDescriptionController;
const improveDescriptionController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { text, context } = req.body;
        if (!text || typeof text !== 'string') {
            next(new appError_1.appError('Text to improve is required', 400));
            return;
        }
        if (!context || typeof context !== 'string') {
            next(new appError_1.appError('Context is required', 400));
            return;
        }
        const description = yield aiService_1.aiService.improveDescription(text, context);
        res.json({
            success: true,
            statusCode: 200,
            message: 'Description improved successfully',
            data: { description },
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.improveDescriptionController = improveDescriptionController;
const generateDocumentController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { documentType, platformName = 'AIR Manu' } = req.body;
        if (!documentType || !['privacy-policy', 'terms-and-conditions', 'help-and-support'].includes(documentType)) {
            return next(new appError_1.appError('A valid documentType is required.', 400));
        }
        const content = yield aiService_1.aiService.generateDocument(documentType, platformName);
        res.json({
            success: true,
            statusCode: 200,
            message: 'Document content generated successfully.',
            data: { content },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.generateDocumentController = generateDocumentController;
const generateGenericText = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { prompt } = req.body;
        if (!prompt || typeof prompt !== 'string') {
            next(new appError_1.appError('Prompt is required', 400));
            return;
        }
        const text = yield aiService_1.aiService.generateText(prompt);
        res.json({
            success: true,
            statusCode: 200,
            message: 'Text generated successfully',
            data: { text },
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.generateGenericText = generateGenericText;
const getAIFoodSuggestions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit = 10, cuisine, dietary } = req.query;
        // Get all hotels with their menu items
        const hotels = yield hotel_model_1.Hotel.find({
            isDeleted: false,
            'menuCategories.0': { $exists: true } // Only hotels with menu items
        }).select('name location menuCategories rating');
        if (!hotels || hotels.length === 0) {
            res.json({
                success: true,
                statusCode: 200,
                message: 'No menu items found',
                data: [],
            });
            return;
        }
        // Collect all menu items from all hotels
        const allMenuItems = [];
        hotels.forEach(hotel => {
            hotel.menuCategories.forEach(category => {
                category.items.forEach(item => {
                    allMenuItems.push(Object.assign(Object.assign({}, item.toObject()), { hotelName: hotel.name, hotelLocation: hotel.location, hotelRating: hotel.rating, categoryName: category.name, hotelId: hotel._id }));
                });
            });
        });
        // Filter based on query parameters
        let filteredItems = allMenuItems;
        if (cuisine) {
            filteredItems = filteredItems.filter(item => item.categoryName.toLowerCase().includes(cuisine.toLowerCase()));
        }
        if (dietary) {
            const dietaryFilter = dietary.toLowerCase();
            filteredItems = filteredItems.filter(item => {
                if (dietaryFilter === 'veg')
                    return item.isVeg;
                if (dietaryFilter === 'nonveg')
                    return item.isNonVeg;
                if (dietaryFilter === 'egg')
                    return item.isEgg;
                return true;
            });
        }
        // Sort by rating and popularity
        filteredItems.sort((a, b) => {
            // Prioritize highly reordered items and higher hotel ratings
            const scoreA = (a.isHighlyReordered ? 2 : 0) + (a.hotelRating || 0);
            const scoreB = (b.isHighlyReordered ? 2 : 0) + (b.hotelRating || 0);
            return scoreB - scoreA;
        });
        // Get top items for AI analysis
        const topItems = filteredItems.slice(0, Math.min(20, filteredItems.length));
        // Generate AI suggestions
        const aiSuggestions = yield aiService_1.aiService.generateFoodSuggestions(topItems, Number(limit));
        res.json({
            success: true,
            statusCode: 200,
            message: 'AI food suggestions generated successfully',
            data: aiSuggestions,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getAIFoodSuggestions = getAIFoodSuggestions;
const getHotelMenuChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hotelId, message, conversationHistory = [] } = req.body;
        if (!hotelId || !message) {
            next(new appError_1.appError('Hotel ID and message are required', 400));
            return;
        }
        // Get the specific hotel with its menu
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: hotelId,
            isDeleted: false
        }).select('name location menuCategories cuisine price rating offers preBookOffers walkInOffers bankBenefits aboutInfo');
        if (!hotel) {
            next(new appError_1.appError('Hotel not found', 404));
            return;
        }
        // Generate AI response for hotel menu chat
        const aiResponse = yield aiService_1.aiService.generateHotelMenuChat(hotel, message, conversationHistory);
        res.json({
            success: true,
            statusCode: 200,
            message: 'AI menu chat response generated successfully',
            data: {
                response: aiResponse,
                hotelName: hotel.name,
                timestamp: new Date().toISOString()
            },
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getHotelMenuChat = getHotelMenuChat;
