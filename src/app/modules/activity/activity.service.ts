import { Activity } from './activity.model';
import { IActivity, IActivityFilters, IActivityResponse } from './activity.interface';

class ActivityService {
  // Log a new activity
  static async logActivity(activityData: Omit<IActivity, '_id' | 'timestamp' | 'isActive'>): Promise<IActivity> {
    try {
      const activity = new Activity({
        ...activityData,
        timestamp: new Date(),
        isActive: true
      });
      
      return await activity.save();
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  // Get activities with pagination and filters
  static async getActivities(
    page: number = 1,
    limit: number = 20,
    filters: IActivityFilters = {}
  ): Promise<IActivityResponse> {
    try {
      const skip = (page - 1) * limit;
      
      // Build query
      const query: any = { isActive: true };
      
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
      const activities = await Activity.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Get total count
      const total = await Activity.countDocuments(query);

      // Calculate summary statistics
      const summary = await this.getActivitySummary();

      return {
        activities: activities as IActivity[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        summary
      };
    } catch (error) {
      console.error('Error getting activities:', error);
      throw error;
    }
  }

  // Get activity summary statistics
  static async getActivitySummary() {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [
        totalActivities,
        todayActivities,
        weeklyActivities,
        actionBreakdown,
        entityTypeBreakdown
      ] = await Promise.all([
        Activity.countDocuments({ isActive: true }),
        Activity.countDocuments({ 
          isActive: true, 
          timestamp: { $gte: todayStart } 
        }),
        Activity.countDocuments({ 
          isActive: true, 
          timestamp: { $gte: weekStart } 
        }),
        Activity.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$action', count: { $sum: 1 } } },
          { $project: { _id: 0, action: '$_id', count: 1 } }
        ]),
        Activity.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$entityType', count: { $sum: 1 } } },
          { $project: { _id: 0, entityType: '$_id', count: 1 } }
        ])
      ]);

      // Convert aggregation results to objects
      const actionBreakdownObj: Record<string, number> = {};
      actionBreakdown.forEach((item: any) => {
        actionBreakdownObj[item.action] = item.count;
      });

      const entityTypeBreakdownObj: Record<string, number> = {};
      entityTypeBreakdown.forEach((item: any) => {
        entityTypeBreakdownObj[item.entityType] = item.count;
      });

      return {
        totalActivities,
        todayActivities,
        weeklyActivities,
        actionBreakdown: actionBreakdownObj,
        entityTypeBreakdown: entityTypeBreakdownObj
      };
    } catch (error) {
      console.error('Error getting activity summary:', error);
      throw error;
    }
  }

  // Get recent activities for dashboard
  static async getRecentActivities(limit: number = 10): Promise<IActivity[]> {
    try {
      return await Activity.find({ isActive: true })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean() as IActivity[];
    } catch (error) {
      console.error('Error getting recent activities:', error);
      throw error;
    }
  }
}

export default ActivityService;
