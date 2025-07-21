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
exports.getRecentActivities = exports.getActivitySummary = exports.getAllActivities = void 0;
const activity_service_1 = __importDefault(require("./activity.service"));
// Get all activities with pagination and filters
const getAllActivities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const filters = {};
        if (req.query.actorRole)
            filters.actorRole = req.query.actorRole;
        if (req.query.action)
            filters.action = req.query.action;
        if (req.query.entityType)
            filters.entityType = req.query.entityType;
        if (req.query.actorId)
            filters.actorId = req.query.actorId;
        if (req.query.startDate)
            filters.startDate = new Date(req.query.startDate);
        if (req.query.endDate)
            filters.endDate = new Date(req.query.endDate);
        const result = yield activity_service_1.default.getActivities(page, limit, filters);
        res.status(200).json({
            success: true,
            message: 'Platform activities retrieved successfully',
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving activities',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
exports.getAllActivities = getAllActivities;
// Get activity summary
const getActivitySummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const summary = yield activity_service_1.default.getActivitySummary();
        res.status(200).json({
            success: true,
            message: 'Activity summary retrieved successfully',
            data: summary,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving activity summary',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
exports.getActivitySummary = getActivitySummary;
// Get recent activities for dashboard
const getRecentActivities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const activities = yield activity_service_1.default.getRecentActivities(limit);
        res.status(200).json({
            success: true,
            message: 'Recent activities retrieved successfully',
            data: activities,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving recent activities',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
exports.getRecentActivities = getRecentActivities;
