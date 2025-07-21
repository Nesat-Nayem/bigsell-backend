import { Response, NextFunction } from "express";
import { userInterface } from "./userInterface";
import { appError } from "../errors/appError";

export const adminStaffMiddleware = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  
  
  try {
    // Check if user exists in request (set by authMiddleware)
    if (!req.user) {
      return next(new appError("Authentication required", 401));
    }
    

    // Check if user is an admin staff member
    if (req.user.role !== 'admin-staff') {
      return next(new appError("Access denied. Admin staff access required", 403));
    }

    // Check if admin staff is active
    if (req.user.status !== 'active') {
      return next(new appError("Your account is inactive", 403));
    }

    // User is an admin staff member, proceed to next middleware
    next();
  } catch (error) {
    next(error);
  }
};