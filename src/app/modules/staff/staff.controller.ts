import { Request, Response, NextFunction } from "express";
// import { Staff } from "./staff.model";
import { Hotel } from "../hotel/hotel.model";
import { User } from "../auth/auth.model";
import { staffCreateValidation, staffLoginValidation, staffUpdateValidation } from "./staff.validation";
import { generateToken } from "../../config/generateToken";
import { appError } from "../../errors/appError";
import { userInterface } from "../../middlewares/userInterface";
import { Staff } from "./staff.model";


// Create a new staff member (vendor only)
export const createStaff = async (
  req: userInterface,
  res: Response,
  next: NextFunction
  
) => {
  
  
  try {
    // Validate request body
    const { name, email, password, phone, hotelId } = staffCreateValidation.parse(req.body);
    
    // Check if email already exists
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return next(new appError("Email already in use", 400));
    }
    
    // Check if hotel exists and belongs to the vendor
    const hotel = await Hotel.findOne({ 
      _id: hotelId, 
      vendorId: req.user._id,
      isDeleted: false 
    });
    
    if (!hotel) {
      return next(new appError("Hotel not found or you don't have permission to add staff to this hotel", 404));
    }
    
    // Create new staff member
    const staff = new Staff({
      name,
      email,
      password,
      phone,
      hotelId,
      vendorId: req.user._id,
      status: 'active',
      role: 'staff'
    });
    
    await staff.save();
    
    // Remove password from response
    const staffObj = staff.toObject();
    delete (staffObj as any).password;
    
    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Staff member created successfully",
      data: staffObj
    });
  } catch (error) {
    next(error);
  }
};

// Staff login
export const staffLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = staffLoginValidation.parse(req.body);
    
    // Find staff by email
    const staff = await Staff.findOne({ email }).populate('hotelId', 'name');
    
    if (!staff) {
      return next(new appError("Invalid email or password", 401));
    }
    
    // Check if staff is active
    if (staff.status !== 'active') {
      return next(new appError("Your account is inactive. Please contact your manager", 403));
    }
    
    // Verify password
    const isPasswordValid = await staff.comparePassword(password);
    if (!isPasswordValid) {
      return next(new appError("Invalid email or password", 401));
    }
    
    // Generate token
    const token = generateToken(staff);
    
    // Remove password from response
    const staffObj = staff.toObject();
    delete (staffObj as any).password;
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Staff login successful",
      token,
      data: staffObj
    });
  } catch (error) {
    next(error);
  }
};

// Get all staff members for a vendor
export const getVendorStaff = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const staff = await Staff.find({ 
      vendorId: req.user._id 
    }).populate('hotelId', 'name').select('-password');
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Staff members retrieved successfully",
      data: staff
    });
  } catch (error) {
    next(error);
  }
};

// Get staff by ID
export const getStaffById = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const staff = await Staff.findOne({ 
      _id: req.params.id,
      vendorId: req.user._id 
    }).populate('hotelId', 'name').select('-password');
    
    if (!staff) {
      return next(new appError("Staff member not found", 404));
    }
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Staff member retrieved successfully",
      data: staff
    });
  } catch (error) {
    next(error);
  }
};

// Update staff
export const updateStaff = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const staffId = req.params.id;
    
    // Validate request body
    const validatedData = staffUpdateValidation.parse(req.body);
    
    // Check if staff exists and belongs to the vendor
    const staff = await Staff.findOne({ 
      _id: staffId,
      vendorId: req.user._id 
    });
    
    if (!staff) {
      return next(new appError("Staff member not found", 404));
    }
    
    // If hotelId is being updated, check if hotel exists and belongs to the vendor
    if (validatedData.hotelId) {
      const hotel = await Hotel.findOne({ 
        _id: validatedData.hotelId, 
        vendorId: req.user._id,
        isDeleted: false 
      });
      
      if (!hotel) {
        return next(new appError("Hotel not found or you don't have permission to assign staff to this hotel", 404));
      }
    }
    
    // Update staff
    const updatedStaff = await Staff.findByIdAndUpdate(
      staffId,
      validatedData,
      { new: true }
    ).populate('hotelId', 'name').select('-password');
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Staff member updated successfully",
      data: updatedStaff
    });
  } catch (error) {
    next(error);
  }
};

// Delete staff
export const deleteStaff = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const staffId = req.params.id;
    
    // Check if staff exists and belongs to the vendor
    const staff = await Staff.findOne({ 
      _id: staffId,
      vendorId: req.user._id 
    });
    
    if (!staff) {
      return next(new appError("Staff member not found", 404));
    }
    
    // Delete staff
    await Staff.findByIdAndDelete(staffId);
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Staff member deleted successfully",
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// Get hotel menu categories for staff
export const getStaffHotelMenu = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is staff
    if (req.user.role !== 'staff') {
      return next(new appError("Access denied", 403));
    }
    
    // Get staff details with hotel
    const staff = await Staff.findById(req.user._id);
    if (!staff) {
      return next(new appError("Staff not found", 404));
    }
    
    // Get hotel menu
    const hotel = await Hotel.findOne({ 
      _id: staff.hotelId, 
      isDeleted: false 
    });
    
    if (!hotel) {
      return next(new appError("Hotel not found", 404));
    }
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Hotel menu retrieved successfully",
      data: {
        hotel: {
          id: hotel._id,
          name: hotel.name
        },
        menuCategories: hotel.menuCategories
      }
    });
  } catch (error) {
    next(error);
  }
};