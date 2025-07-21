import { Request, Response, NextFunction } from "express";
import { AdminStaff } from "./admin-staff.model";
import { adminStaffCreateValidation, adminStaffLoginValidation, adminStaffUpdateValidation } from "./admin-staff.validation";
import { generateToken } from "../../config/generateToken";
import { appError } from "../../errors/appError";
import { userInterface } from "../../middlewares/userInterface";

// Create a new admin staff member (admin only)
export const createAdminStaff = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request body
    const { name, email, password, phone, permissions } = adminStaffCreateValidation.parse(req.body);
    
    // Check if email already exists
    const existingAdminStaff = await AdminStaff.findOne({ email });
    if (existingAdminStaff) {
      return next(new appError("Email already in use", 400));
    }
    
    // Create new admin staff member
    const adminStaff = new AdminStaff({
      name,
      email,
      password,
      phone,
      permissions,
      createdBy: req.user._id,
      status: 'active',
      role: 'admin-staff'
    });
    
    
    await adminStaff.save();
    
    // Remove password from response
    const adminStaffObj = adminStaff.toObject();
    delete (adminStaffObj as any).password;
    
    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Admin staff member created successfully",
      data: adminStaffObj
    });
  } catch (error) {
    next(error);
  }
};

// Admin staff login
export const adminStaffLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = adminStaffLoginValidation.parse(req.body);
    
    // Find admin staff by email
    const adminStaff = await AdminStaff.findOne({ email });
    
    if (!adminStaff) {
      return next(new appError("Invalid email or password", 401));
    }
    
    // Check if admin staff is active
    if (adminStaff.status !== 'active') {
      return next(new appError("Your account is inactive. Please contact the administrator", 403));
    }
    
    // Verify password
    const isPasswordValid = await adminStaff.comparePassword(password);
    if (!isPasswordValid) {
      return next(new appError("Invalid email or password", 401));
    }
    
    // Generate token
    const token = generateToken(adminStaff as any);
    
    // Remove password from response
    const adminStaffObj = adminStaff.toObject();
    delete (adminStaffObj as any).password;
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Admin staff login successful",
      token,
      data: adminStaffObj
    });
  } catch (error) {
    next(error);
  }
};

// Get all admin staff members
export const getAdminStaff = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { deleted } = req.query;
    const filter = { isDeleted: deleted === 'true' };
    const adminStaff = await AdminStaff.find(filter).select('-password').populate('createdBy', 'name email');
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Admin staff members retrieved successfully",
      data: adminStaff
    });
  } catch (error) {
    next(error);
  }
};

// Get admin staff by ID
export const getAdminStaffById = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminStaff = await AdminStaff.findById(req.params.id).select('-password').populate('createdBy', 'name email');
    
    if (!adminStaff) {
      return next(new appError("Admin staff member not found", 404));
    }
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Admin staff member retrieved successfully",
      data: adminStaff
    });
  } catch (error) {
    next(error);
  }
};

// Update admin staff
export const updateAdminStaff = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminStaffId = req.params.id;
    
    // Validate request body
    const validatedData = adminStaffUpdateValidation.parse(req.body);
    
    // Check if admin staff exists
    const adminStaff = await AdminStaff.findById(adminStaffId);
    
    if (!adminStaff) {
      return next(new appError("Admin staff member not found", 404));
    }
    
    // Check if email is being updated and if it already exists
    if (validatedData.email && validatedData.email !== adminStaff.email) {
      const existingAdminStaff = await AdminStaff.findOne({ 
        email: validatedData.email,
        _id: { $ne: adminStaffId }
      });
      
      if (existingAdminStaff) {
        return next(new appError("Email already in use", 400));
      }
    }
    
    // Update admin staff
    const updatedAdminStaff = await AdminStaff.findByIdAndUpdate(
      adminStaffId,
      validatedData,
      { new: true }
    ).select('-password').populate('createdBy', 'name email');
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Admin staff member updated successfully",
      data: updatedAdminStaff
    });
  } catch (error) {
    next(error);
  }
};

// Delete admin staff
export const deleteAdminStaff = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminStaffId = req.params.id;
    
    // Check if admin staff exists
    const adminStaff = await AdminStaff.findById(adminStaffId);
    
    if (!adminStaff) {
      return next(new appError("Admin staff member not found", 404));
    }
    
    // Soft delete admin staff
    adminStaff.isDeleted = true;
    await adminStaff.save();
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Admin staff member deleted successfully",
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// Restore admin staff
export const restoreAdminStaff = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminStaffId = req.params.id;
    
    // Check if admin staff exists
    const adminStaff = await AdminStaff.findById(adminStaffId);
    
    if (!adminStaff) {
      return next(new appError("Admin staff member not found", 404));
    }
    
    // Restore admin staff
    adminStaff.isDeleted = false;
    await adminStaff.save();
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Admin staff member restored successfully",
      data: adminStaff
    });
  } catch (error) {
    next(error);
  }
}