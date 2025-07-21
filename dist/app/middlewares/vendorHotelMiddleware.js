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
exports.vendorHotelMiddleware = void 0;
const appError_1 = require("../errors/appError");
const hotel_model_1 = require("../modules/hotel/hotel.model");
const vendorHotelMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return next(new appError_1.appError('Authentication required', 401));
        }
        // If the user is an admin, they can proceed.
        if (req.user.role === 'admin') {
            return next();
        }
        // If the user is a vendor, find their hotel and attach it.
        if (req.user.role === 'vendor') {
            const hotel = yield hotel_model_1.Hotel.findOne({ vendorId: req.user._id, isDeleted: false });
            // We don't block if they don't have a hotel yet, 
            // as they might be in the process of creating one.
            // The controller logic will handle authorization.
            if (hotel) {
                req.user.vendorDetails = { hotel: hotel._id };
            }
            return next();
        }
        // If the user is a staff, find their hotel and attach it.
        if (req.user.role === 'staff') {
            if (req.user.hotelId) {
                req.user.vendorDetails = { hotel: req.user.hotelId };
            }
            return next();
        }
        // For any other role, deny access if the route is vendor-specific.
        return next(new appError_1.appError('You do not have permission to perform this action', 403));
    }
    catch (error) {
        next(error);
    }
});
exports.vendorHotelMiddleware = vendorHotelMiddleware;
