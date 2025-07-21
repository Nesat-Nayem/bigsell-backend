import { Request, Response } from 'express';
import ActivityService from './activity.service';
import { IActivityFilters } from './activity.interface';

// Get all activities with pagination and filters
export const getAllActivities = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const filters: IActivityFilters = {};
    
    if (req.query.actorRole) filters.actorRole = req.query.actorRole as string;
    if (req.query.action) filters.action = req.query.action as string;
    if (req.query.entityType) filters.entityType = req.query.entityType as string;
    if (req.query.actorId) filters.actorId = req.query.actorId as string;
    if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

    const result = await ActivityService.getActivities(page, limit, filters);

    res.status(200).json({
      success: true,
      message: 'Platform activities retrieved successfully',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving activities',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get activity summary
export const getActivitySummary = async (req: Request, res: Response) => {
  try {
    const summary = await ActivityService.getActivitySummary();

    res.status(200).json({
      success: true,
      message: 'Activity summary retrieved successfully',
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving activity summary',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get recent activities for dashboard
export const getRecentActivities = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const activities = await ActivityService.getRecentActivities(limit);

    res.status(200).json({
      success: true,
      message: 'Recent activities retrieved successfully',
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving recent activities',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
