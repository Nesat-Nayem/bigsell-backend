import { Response, NextFunction } from "express";
import { Hotel } from "../hotel/hotel.model";
// import { Staff } from "./staff.model";
import { appError } from "../../errors/appError";
import { userInterface } from "../../middlewares/userInterface";
import { Staff } from "./staff.model";

// Get all menu items for staff's hotel
export const getAllMenuItems = async (
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
    
    // Extract all menu items from all categories
    const allMenuItems = [];
    
    for (const category of hotel.menuCategories) {
      const categoryItems = category.items.map(item => ({
        ...item.toObject(),
        categoryName: category.name
      }));
      
      allMenuItems.push(...categoryItems);
    }
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "All menu items retrieved successfully",
      data: {
        hotel: {
          id: hotel._id,
          name: hotel.name
        },
        items: allMenuItems
      }
    });
  } catch (error) {
    next(error);
  }
};

// Search menu items
export const searchMenuItems = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req.query;
    
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
    
    // Search for menu items
    const searchResults = [];
    
    
    for (const category of hotel.menuCategories) {
      const matchingItems = category.items.filter(item => 
        item.title.toLowerCase().includes((query as string || '').toLowerCase()) ||
        item.description.toLowerCase().includes((query as string || '').toLowerCase())
      ).map(item => ({
        ...item.toObject(),
        categoryName: category.name
      }));
      
      searchResults.push(...matchingItems);
    }
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Search results retrieved successfully",
      data: searchResults
    });
  } catch (error) {
    next(error);
  }
};