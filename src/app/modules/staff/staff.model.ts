import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IStaff extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  hotelId: mongoose.Schema.Types.ObjectId;
  vendorId: mongoose.Schema.Types.ObjectId;
  status: 'active' | 'inactive';
  role: 'staff';
  comparePassword(password: string): Promise<boolean>;
}




const staffSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    hotelId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Hotel',
      required: true 
    },
    vendorId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    status: { 
      type: String, 
      enum: ['active', 'inactive'], 
      default: 'active' 
    },
    role: { 
      type: String, 
      default: 'staff' 
    }
  },
  { timestamps: true }
);

staffSchema.pre<IStaff>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


staffSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export const Staff = mongoose.model<IStaff>('Staff', staffSchema);