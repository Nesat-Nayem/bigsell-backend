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
exports.vendorMiddleware = void 0;
const vendorMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user exists in request (set by authMiddleware)
        if (!req.user) {
            res.status(401).json({
                success: false,
                statusCode: 401,
                message: "Authentication required",
            });
            return;
        }
        // Check if user is a vendor
        if (req.user.role !== 'vendor') {
            res.status(403).json({
                success: false,
                statusCode: 403,
                message: "Access denied. Vendor access required",
            });
            return;
        }
        // User is a vendor, proceed to next middleware
        next();
    }
    catch (error) {
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: "Internal server error",
        });
        return;
    }
});
exports.vendorMiddleware = vendorMiddleware;
