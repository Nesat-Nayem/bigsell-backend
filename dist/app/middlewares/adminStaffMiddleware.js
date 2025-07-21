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
exports.adminStaffMiddleware = void 0;
const appError_1 = require("../errors/appError");
const adminStaffMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user exists in request (set by authMiddleware)
        if (!req.user) {
            return next(new appError_1.appError("Authentication required", 401));
        }
        // Check if user is an admin staff member
        if (req.user.role !== 'admin-staff') {
            return next(new appError_1.appError("Access denied. Admin staff access required", 403));
        }
        // Check if admin staff is active
        if (req.user.status !== 'active') {
            return next(new appError_1.appError("Your account is inactive", 403));
        }
        // User is an admin staff member, proceed to next middleware
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.adminStaffMiddleware = adminStaffMiddleware;
