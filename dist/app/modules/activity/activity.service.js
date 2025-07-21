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
const activity_model_1 = require("./activity.model");
class ActivityService {
    // Log a new activity
    static logActivity(activityData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const activity = new activity_model_1.Activity(Object.assign(Object.assign({}, activityData), { timestamp: new Date(), isActive: true }));
                return yield activity.save();
            }
            catch (error) {
                console.error('Error logging activity:', error);
                throw error;
            }
        });
    }
    // Get activities with pagination and filters
    static getActivities() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 20, filters = {}) {
            try {
                const skip = (page - 1) * limit;
                // Build query
                const query = { isActive: true };
                if (filters.actorRole) {
                    query.actorRole = filters.actorRole;
                }
                if (filters.action) {
                    query.action = filters.action;
                }
                if (filters.entityType) {
                    query.entityType = filters.entityType;
                }
                if (filters.actorId) {
                    query.actorId = filters.actorId;
                }
                if (filters.startDate || filters.endDate) {
                    query.timestamp = {};
                    if (filters.startDate) {
                        query.timestamp.$gte = filters.startDate;
                    }
                    if (filters.endDate) {
                        query.timestamp.$lte = filters.endDate;
                    }
                }
                // Get activities
                const activities = yield activity_model_1.Activity.find(query)
                    .sort({ timestamp: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean();
                // Get total count
                const total = yield activity_model_1.Activity.countDocuments(query);
                // Calculate summary statistics
                const summary = yield this.getActivitySummary();
                return {
                    activities: activities,
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    summary
                };
            }
            catch (error) {
                console.error('Error getting activities:', error);
                throw error;
            }
        });
    }
    // Get activity summary statistics
    static getActivitySummary() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const now = new Date();
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                const [totalActivities, todayActivities, weeklyActivities, actionBreakdown, entityTypeBreakdown] = yield Promise.all([
                    activity_model_1.Activity.countDocuments({ isActive: true }),
                    activity_model_1.Activity.countDocuments({
                        isActive: true,
                        timestamp: { $gte: todayStart }
                    }),
                    activity_model_1.Activity.countDocuments({
                        isActive: true,
                        timestamp: { $gte: weekStart }
                    }),
                    activity_model_1.Activity.aggregate([
                        { $match: { isActive: true } },
                        { $group: { _id: '$action', count: { $sum: 1 } } },
                        { $project: { _id: 0, action: '$_id', count: 1 } }
                    ]),
                    activity_model_1.Activity.aggregate([
                        { $match: { isActive: true } },
                        { $group: { _id: '$entityType', count: { $sum: 1 } } },
                        { $project: { _id: 0, entityType: '$_id', count: 1 } }
                    ])
                ]);
                // Convert aggregation results to objects
                const actionBreakdownObj = {};
                actionBreakdown.forEach((item) => {
                    actionBreakdownObj[item.action] = item.count;
                });
                const entityTypeBreakdownObj = {};
                entityTypeBreakdown.forEach((item) => {
                    entityTypeBreakdownObj[item.entityType] = item.count;
                });
                return {
                    totalActivities,
                    todayActivities,
                    weeklyActivities,
                    actionBreakdown: actionBreakdownObj,
                    entityTypeBreakdown: entityTypeBreakdownObj
                };
            }
            catch (error) {
                console.error('Error getting activity summary:', error);
                throw error;
            }
        });
    }
    // Get recent activities for dashboard
    static getRecentActivities() {
        return __awaiter(this, arguments, void 0, function* (limit = 10) {
            try {
                return yield activity_model_1.Activity.find({ isActive: true })
                    .sort({ timestamp: -1 })
                    .limit(limit)
                    .lean();
            }
            catch (error) {
                console.error('Error getting recent activities:', error);
                throw error;
            }
        });
    }
}
exports.default = ActivityService;
