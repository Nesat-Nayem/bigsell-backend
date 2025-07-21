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
exports.searchMenuItems = exports.getAllMenuItems = void 0;
const hotel_model_1 = require("../hotel/hotel.model");
// import { Staff } from "./staff.model";
const appError_1 = require("../../errors/appError");
const staff_model_1 = require("./staff.model");
// Get all menu items for staff's hotel
const getAllMenuItems = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user is staff
        if (req.user.role !== 'staff') {
            return next(new appError_1.appError("Access denied", 403));
        }
        // Get staff details with hotel
        const staff = yield staff_model_1.Staff.findById(req.user._id);
        if (!staff) {
            return next(new appError_1.appError("Staff not found", 404));
        }
        // Get hotel menu
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: staff.hotelId,
            isDeleted: false
        });
        if (!hotel) {
            return next(new appError_1.appError("Hotel not found", 404));
        }
        // Extract all menu items from all categories
        const allMenuItems = [];
        for (const category of hotel.menuCategories) {
            const categoryItems = category.items.map(item => (Object.assign(Object.assign({}, item.toObject()), { categoryName: category.name })));
            allMenuItems.push(...categoryItems);
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "All menu items retrieved successfully",
            data: {
                hotel: {
                    id: hotel._id,
                    name: hotel.name
                },
                items: allMenuItems
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllMenuItems = getAllMenuItems;
// Search menu items
const searchMenuItems = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.query;
        // Check if user is staff
        if (req.user.role !== 'staff') {
            return next(new appError_1.appError("Access denied", 403));
        }
        // Get staff details with hotel
        const staff = yield staff_model_1.Staff.findById(req.user._id);
        if (!staff) {
            return next(new appError_1.appError("Staff not found", 404));
        }
        // Get hotel menu
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: staff.hotelId,
            isDeleted: false
        });
        if (!hotel) {
            return next(new appError_1.appError("Hotel not found", 404));
        }
        // Search for menu items
        const searchResults = [];
        for (const category of hotel.menuCategories) {
            const matchingItems = category.items.filter(item => item.title.toLowerCase().includes((query || '').toLowerCase()) ||
                item.description.toLowerCase().includes((query || '').toLowerCase())).map(item => (Object.assign(Object.assign({}, item.toObject()), { categoryName: category.name })));
            searchResults.push(...matchingItems);
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Search results retrieved successfully",
            data: searchResults
        });
    }
    catch (error) {
        next(error);
    }
});
exports.searchMenuItems = searchMenuItems;
