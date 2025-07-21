import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';


const MenuBookmarkSchema = new Schema({
  menuItemId: {
    type: String,
    required: true
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
    
  },
  hotelName: {
    type: String,
    required: true
  },
  
  
  menuTitle: {
    type: String,
    required: true
  },
  menuImage: {
    type: String,
    required: true
  },
  menuPrice: {
    type: Number,
    required: true
  },
  bookmarkedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

export interface IUser extends Document {
  name: string;
  img: string;
  password: string;
  phone: string;
  email: string;
  role: 'admin' | 'vendor'|'user';
  otp?: string;
  otpExpires?: Date;
  packageFeatures?: string[];
  menuBookmarks?: typeof MenuBookmarkSchema[];
  comparePassword(password: string): Promise<boolean>;
  compareOtp(otp: string): boolean;
}



const userSchema: Schema = new Schema(
  {
    name: { type: String }, 
    password: { type: String }, 
    phone: { type: String, required: true },
    email: { type: String }, 
    img: { type: String },
    role: { type: String, enum: ['admin','vendor', 'user'], default: 'user' },
    status: { type: String, enum: ['pending', 'active'], default: 'active' },
    otp: { type: String },
    otpExpires: { type: Date },

    packageFeatures: {
        type: [String],
        default: []
    },

    menuBookmarks: {
    type: [MenuBookmarkSchema],
    default: []
  },
  },
  { timestamps: true }
);


userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Add method to compare OTP
userSchema.methods.compareOtp = function (otp: string): boolean {
  return this.otp === otp && this.otpExpires && this.otpExpires > new Date();
};


// Add index for phone
userSchema.index({ phone: 1 }, { unique: true });

export const User = mongoose.model<IUser>('User', userSchema);
