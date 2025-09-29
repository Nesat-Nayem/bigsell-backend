import { Document, Types } from 'mongoose'

export type KycStatus = 'pending' | 'approved' | 'rejected'
export type PaymentStatus = 'pending' | 'done' | 'failed'

export interface IVendorApplication extends Document {
  vendorName: string
  email: string
  phone: string
  address: string
  gstNo?: string

  subscriptionId?: Types.ObjectId
  planName?: string
  planPrice?: number
  planBillingCycle?: 'monthly' | 'yearly'
  planColor?: string

  aadharUrl: string
  panUrl: string

  paymentStatus?: PaymentStatus
  paymentAmount?: number

  kycStatus: KycStatus
  credentialSent?: boolean
  vendorUserId?: Types.ObjectId
  isDeleted: boolean

  createdAt: Date
  updatedAt: Date
}
