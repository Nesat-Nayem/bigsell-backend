import mongoose, { Schema } from 'mongoose';
import { IActivity } from './activity.interface';

const ActivitySchema = new Schema<IActivity>({
  actorId: {
    type: String,
    required: true,
    trim: true
  },
  actorName: {
    type: String,
    required: true,
    trim: true
  },
  actorRole: {
    type: String,
    required: true,
    enum: ['admin', 'vendor', 'staff'],
    trim: true
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'restore'],
    trim: true
  },
  entityType: {
    type: String,
    required: true,
    enum: ['restaurant', 'menu_category', 'menu_item', 'buffet', 'offer', 'about_info', 'gallery', 'settings'],
    trim: true
  },
  entityId: {
    type: String,
    required: true,
    trim: true
  },
  entityName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for efficient querying
ActivitySchema.index({ timestamp: -1 });
ActivitySchema.index({ actorId: 1, timestamp: -1 });
ActivitySchema.index({ entityType: 1, timestamp: -1 });
ActivitySchema.index({ action: 1, timestamp: -1 });
ActivitySchema.index({ actorRole: 1, timestamp: -1 });

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);
