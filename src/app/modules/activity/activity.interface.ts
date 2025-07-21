export interface IActivity {
  _id?: string;
  actorId: string;
  actorName: string;
  actorRole: 'admin' | 'vendor' | 'staff';
  action: 'create' | 'update' | 'delete' | 'restore';
  entityType: 'restaurant' | 'menu_category' | 'menu_item' | 'buffet' | 'offer' | 'about_info' | 'gallery' | 'settings';
  entityId: string;
  entityName: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  isActive: boolean;
}

export interface IActivityFilters {
  actorRole?: string;
  action?: string;
  entityType?: string;
  actorId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface IActivityResponse {
  activities: IActivity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    totalActivities: number;
    todayActivities: number;
    weeklyActivities: number;
    actionBreakdown: Record<string, number>;
    entityTypeBreakdown: Record<string, number>;
  };
}
