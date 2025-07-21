// utils/generateToken.ts
import jwt from 'jsonwebtoken';
import { IUser } from '../modules/auth/auth.model';
import { IStaff } from '../modules/staff/staff.model';
export const generateToken = (user: IUser | IStaff) => {
  const payload = {
    userId: user._id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    // address: user.address,
  };
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });
};

// test

