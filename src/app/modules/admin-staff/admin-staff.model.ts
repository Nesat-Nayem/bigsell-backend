import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IAdminStaff extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  permissions: {
    dashboard: boolean;
    orders: boolean;
    restaurants: boolean;
    tableBookings: boolean;
    vendorKyc: boolean;
    categories: boolean;
    banners: boolean;
    exclusiveOffers: boolean;
    featureOffers: boolean;
    contacts: boolean;
    pricing: boolean;
    blog: boolean;
    qrCodes: boolean;
    faq: boolean;
    privacyPolicy: boolean;
    termsConditions: boolean;
    helpSupport: boolean;
  };
  status: 'active' | 'inactive';
  role: 'admin-staff';
  createdBy: mongoose.Schema.Types.ObjectId;
  isDeleted: boolean;
  comparePassword(password: string): Promise<boolean>;
}

const adminStaffSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    permissions: {
      dashboard: { type: Boolean, default: false },
      orders: { type: Boolean, default: false },
      restaurants: { type: Boolean, default: false },
      tableBookings: { type: Boolean, default: false },
      vendorKyc: { type: Boolean, default: false },
      categories: { type: Boolean, default: false },
      banners: { type: Boolean, default: false },
      exclusiveOffers: { type: Boolean, default: false },
      featureOffers: { type: Boolean, default: false },
      contacts: { type: Boolean, default: false },
      pricing: { type: Boolean, default: false },
      blog: { type: Boolean, default: false },
      qrCodes: { type: Boolean, default: false },
      faq: { type: Boolean, default: false },
      privacyPolicy: { type: Boolean, default: false },
      termsConditions: { type: Boolean, default: false },
      helpSupport: { type: Boolean, default: false },
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    status: { 
      type: String, 
      enum: ['active', 'inactive'], 
      default: 'active' 
    },
    role: { 
      type: String, 
      default: 'admin-staff' 
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    }
  },
  { timestamps: true }
);

adminStaffSchema.pre<IAdminStaff>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminStaffSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export const AdminStaff = mongoose.model<IAdminStaff>('AdminStaff', adminStaffSchema);