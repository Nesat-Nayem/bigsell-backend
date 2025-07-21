import ActivityService from '../activity/activity.service';
import { IActivity } from '../activity/activity.interface';

interface ActivityLogData {
  actorId: string;
  actorName: string;
  actorRole: 'admin' | 'vendor' | 'staff';
  action: 'create' | 'update' | 'delete' | 'restore';
  entityType: 'restaurant' | 'menu_category' | 'menu_item' | 'buffet' | 'offer' | 'about_info' | 'gallery' | 'settings';
  entityId: string;
  entityName: string;
  description: string;
  metadata?: Record<string, any>;
}

export async function logActivity(data: ActivityLogData): Promise<void> {
  try {
    await ActivityService.logActivity(data);
  } catch (error) {
    // Don't throw errors for activity logging to avoid disrupting main operations
    console.error('Failed to log activity:', error);
  }
}
