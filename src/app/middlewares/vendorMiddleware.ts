import { Response, NextFunction } from "express";
import { userInterface } from "./userInterface";

export const vendorMiddleware = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    
    
    // Check if user exists in request (set by authMiddleware)
    if (!req.user) {
      res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Authentication required",
      });
      return;
    }

    
    
    // Check if user is a vendor
    if (req.user.role !== 'vendor') {
      res.status(403).json({
        success: false,
        statusCode: 403,
        message: "Access denied. Vendor access required",
      });
      return;
    }

    // User is a vendor, proceed to next middleware
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error",
    });
    return;
  }
};
