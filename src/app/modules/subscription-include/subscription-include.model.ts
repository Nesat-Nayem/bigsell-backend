import mongoose, { Schema } from 'mongoose'
import { ISubscriptionInclude } from './subscription-include.interface'

const SubscriptionIncludeSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    order: { type: Number, default: 0, min: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        (ret as any).createdAt = new Date((ret as any).createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        ;(ret as any).updatedAt = new Date((ret as any).updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        return ret
      },
    },
  }
)

SubscriptionIncludeSchema.index({ isActive: 1, isDeleted: 1 })
SubscriptionIncludeSchema.index({ order: 1, createdAt: -1 })

export const SubscriptionInclude = mongoose.model<ISubscriptionInclude>('SubscriptionInclude', SubscriptionIncludeSchema)
