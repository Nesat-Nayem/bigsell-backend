import mongoose, { Schema } from 'mongoose'
import { IVendorApplication } from './vendor.interface'

const VendorApplicationSchema: Schema = new Schema(
  {
    vendorName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    address: { type: String, required: true, trim: true },
    gstNo: { type: String, trim: true },

    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    planName: { type: String, trim: true },
    planPrice: { type: Number },
    planBillingCycle: { type: String, enum: ['monthly', 'yearly'] },
    planColor: { type: String },

    aadharUrl: { type: String, required: true },
    panUrl: { type: String, required: true },

    paymentStatus: { type: String, enum: ['pending', 'done', 'failed'], default: 'pending' },
    paymentAmount: { type: Number },

    kycStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    credentialSent: { type: Boolean, default: false },
    vendorUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
)

VendorApplicationSchema.index({ createdAt: -1 })

export const VendorApplication = mongoose.model<IVendorApplication>('VendorApplication', VendorApplicationSchema)
