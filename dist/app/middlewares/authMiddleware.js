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
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_model_1 = require("../modules/auth/auth.model");
const appError_1 = require("../errors/appError");
/**
 * auth middleware
 * usage: auth() -> just authenticate
 *        auth('admin', 'manager') -> authenticate and authorize role
 */
const auth = (...requiredRoles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            // 1) Extract token
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return next(new appError_1.appError("Authentication required. No token provided.", 401));
            }
            const parts = authHeader.split(" ");
            if (parts.length !== 2 || parts[0] !== "Bearer") {
                return next(new appError_1.appError("Invalid authorization header format. Expected 'Bearer <token>'.", 401));
            }
            const token = parts[1];
            // 2) Ensure JWT secret exists
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                // this is a server misconfiguration — 500
                return next(new appError_1.appError("Server misconfiguration: JWT secret not set.", 500));
            }
            // 3) Verify token (jwt.verify throws if invalid/expired)
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            // We expect decoded to be an object containing userId (adjust if your token uses a different claim)
            const userId = typeof decoded === "object" && decoded && decoded.userId
                ? decoded.userId
                : undefined;
            if (!userId) {
                return next(new appError_1.appError("Invalid token payload: missing userId.", 401));
            }
            // 4) Find user across models (add other models if required)
            // Keep a list of candidate models to check — currently only UserModel is enabled
            const modelsToCheck = [auth_model_1.User /*, StaffModel, AdminStaffModel */];
            let user = null;
            for (const Model of modelsToCheck) {
                if (!Model || typeof Model.findById !== "function")
                    continue;
                // Using lean() would return plain object; we may want the full document sometimes
                // Use findById(userId).select('+password') if you need private fields — careful with attaching to req.
                user = yield Model.findById(userId);
                if (user)
                    break;
            }
            if (!user) {
                return next(new appError_1.appError("User not found.", 401));
            }
            // 5) Attach user to request (ensure your userInterface allows this)
            req.user = user;
            // 6) Role-based authorization (if roles provided)
            if (requiredRoles.length > 0) {
                const role = ((_a = user.role) !== null && _a !== void 0 ? _a : "").toString();
                if (!requiredRoles.includes(role)) {
                    return next(new appError_1.appError("You do not have permission to perform this action.", 403));
                }
            }
            return next();
        }
        catch (err) {
            // distinguish between token errors and other errors
            if (err.name === "TokenExpiredError") {
                return next(new appError_1.appError("Token expired. Please login again.", 401));
            }
            if (err.name === "JsonWebTokenError") {
                return next(new appError_1.appError("Invalid token. Please login again.", 401));
            }
            // fallback
            return next(new appError_1.appError("Authentication failed.", 401));
        }
    });
};
exports.auth = auth;
