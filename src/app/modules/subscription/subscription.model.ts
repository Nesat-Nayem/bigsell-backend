import mongoose, { Schema } from 'mongoose';
import { ISubscription } from './subscription.interface';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const SubscriptionSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    color: {
      type: String,
      trim: true, // e.g., 'secondary' | 'warning' | 'info'
      default: 'secondary',
    },
    includeIds: {
      type: [Schema.Types.ObjectId],
      ref: 'SubscriptionInclude',
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    // SEO
    metaTitle: { type: String, trim: true },
    metaTags: { type: [String], default: [] },
    metaDescription: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        (ret as any).createdAt = new Date((ret as any).createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        (ret as any).updatedAt = new Date((ret as any).updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        return ret;
      },
    },
  }
);

// Indexes
SubscriptionSchema.index({ isActive: 1, isDeleted: 1 });
SubscriptionSchema.index({ order: 1, createdAt: -1 });

// Pre-save to generate unique slug if not provided and enforce max 3 active
SubscriptionSchema.pre<ISubscription>('save', async function (next) {
  try {
    if (!this.slug && this.name) {
      let base = slugify(this.name);
      let finalSlug = base;
      let counter = 1;
      // Ensure unique slug
      while (
        await mongoose.models.Subscription.findOne({ slug: finalSlug, _id: { $ne: this._id } })
      ) {
        finalSlug = `${base}-${counter++}`;
      }
      this.slug = finalSlug;
    }

    // Enforce at most 3 active (non-deleted)
    if (this.isModified('isActive') || this.isNew) {
      if (this.isActive === true) {
        const count = await mongoose.models.Subscription.countDocuments({ isActive: true, isDeleted: false, _id: { $ne: this._id } });
        if (count >= 3) {
          return next(new Error('Maximum 3 active subscription plans are allowed. Please deactivate another plan first.'));
        }
      }
    }

    next();
  } catch (err) {
    next(err as any);
  }
});

export const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
