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
exports.checkBookmarkStatus = exports.getUserBookmarks = exports.removeMenuBookmark = exports.addMenuBookmark = void 0;
const hotel_model_1 = require("../hotel/hotel.model");
const appError_1 = require("../../errors/appError");
const auth_model_1 = require("../auth/auth.model");
const addMenuBookmark = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { menuItemId, hotelId } = req.body;
        const userId = req.user._id;
        // Find the hotel and menu item
        const hotel = yield hotel_model_1.Hotel.findOne({ _id: hotelId, isDeleted: false });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        // Find the menu item in hotel's menu categories
        let menuItem = null;
        for (const category of hotel.menuCategories) {
            const item = category.items.find(item => item.id === menuItemId);
            if (item) {
                menuItem = item;
                break;
            }
        }
        if (!menuItem) {
            next(new appError_1.appError("Menu item not found", 404));
            return;
        }
        // Find user and check if already bookmarked
        const user = yield auth_model_1.User.findById(userId);
        if (!user) {
            next(new appError_1.appError("User not found", 404));
            return;
        }
        // Check if already bookmarked
        const existingBookmark = (_a = user.menuBookmarks) === null || _a === void 0 ? void 0 : _a.find(bookmark => bookmark.menuItemId === menuItemId);
        if (existingBookmark) {
            next(new appError_1.appError("Menu item already bookmarked", 400));
            return;
        }
        // Add bookmark
        const newBookmark = {
            menuItemId,
            hotelId,
            hotelName: hotel.name,
            menuTitle: menuItem.title,
            menuImage: menuItem.image,
            menuPrice: menuItem.price,
            bookmarkedAt: new Date()
        };
        if (!user.menuBookmarks) {
            user.menuBookmarks = [];
        }
        user.menuBookmarks.push(newBookmark); // Type assertion to fix TS error
        yield user.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Menu item bookmarked successfully",
            data: newBookmark,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.addMenuBookmark = addMenuBookmark;
const removeMenuBookmark = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { menuItemId } = req.params;
        const userId = req.user._id;
        const user = yield auth_model_1.User.findById(userId);
        if (!user) {
            next(new appError_1.appError("User not found", 404));
            return;
        }
        // Find and remove bookmark
        const bookmarkIndex = (_a = user.menuBookmarks) === null || _a === void 0 ? void 0 : _a.findIndex(bookmark => bookmark.menuItemId === menuItemId);
        if (bookmarkIndex === -1 || bookmarkIndex === undefined) {
            next(new appError_1.appError("Bookmark not found", 404));
            return;
        }
        (_b = user.menuBookmarks) === null || _b === void 0 ? void 0 : _b.splice(bookmarkIndex, 1);
        yield user.save();
        res.json({
            success: true,
            statusCode: 200,
            message: "Bookmark removed successfully",
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.removeMenuBookmark = removeMenuBookmark;
const getUserBookmarks = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10 } = req.query;
        const user = yield auth_model_1.User.findById(userId);
        if (!user) {
            next(new appError_1.appError("User not found", 404));
            return;
        }
        const bookmarks = user.menuBookmarks || [];
        // Sort by bookmarked date (newest first)
        const sortedBookmarks = bookmarks.sort((a, b) => new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime());
        // Pagination
        const startIndex = (Number(page) - 1) * Number(limit);
        const endIndex = startIndex + Number(limit);
        const paginatedBookmarks = sortedBookmarks.slice(startIndex, endIndex);
        res.json({
            success: true,
            statusCode: 200,
            message: "Bookmarks retrieved successfully",
            data: {
                bookmarks: paginatedBookmarks,
                total: bookmarks.length,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(bookmarks.length / Number(limit))
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getUserBookmarks = getUserBookmarks;
const checkBookmarkStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { menuItemId } = req.params;
        const userId = req.user._id;
        const user = yield auth_model_1.User.findById(userId);
        if (!user) {
            next(new appError_1.appError("User not found", 404));
            return;
        }
        const isBookmarked = ((_a = user.menuBookmarks) === null || _a === void 0 ? void 0 : _a.some(bookmark => bookmark.menuItemId === menuItemId)) || false;
        res.json({
            success: true,
            statusCode: 200,
            message: "Bookmark status retrieved",
            data: { isBookmarked },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.checkBookmarkStatus = checkBookmarkStatus;
