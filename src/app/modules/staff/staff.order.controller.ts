import { Response, NextFunction } from "express";
import { Order } from "../order/order.model";
import { Hotel } from "../hotel/hotel.model";
import { QRCode } from "../qrcode/qrcode.model";
// import { Staff } from "./staff.model";
import { updateOrderStatusValidation } from "../order/order.validation";
import { staffOrderCreateValidation, staffOrderUpdateValidation } from "./staff.order.validation";
import { appError } from "../../errors/appError";
import { userInterface } from "../../middlewares/userInterface";
import mongoose from "mongoose";
import { Staff } from "./staff.model";

// Create order for customer (staff only)
export const createStaffOrder = async (
  
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  
  try {
    // Validate request body
    const { paymentMethod, paymentId, items, customerId, totalAmount, tableNumber, specialInstructions } = staffOrderCreateValidation.parse(req.body);
    
    // Check if user is staff
    if (req.user.role !== 'staff') {
      return next(new appError("Access denied", 403));
    }
    
    // Get staff details with hotel
    const staff = await Staff.findById(req.user._id);
    if (!staff) {
      return next(new appError("Staff not found", 404));
    }
    
    // Verify all items belong to the staff's hotel
    const hotel = await Hotel.findOne({ 
      _id: staff.hotelId, 
      isDeleted: false 
    });
    
    if (!hotel) {
      return next(new appError("Hotel not found", 404));
    }
    
    // If tableNumber is provided, book it
    if (tableNumber) {
        const table = await QRCode.findOneAndUpdate(
            { hotelId: staff.hotelId, tableNumber: tableNumber, isDeleted: false, status: 'available' },
            { status: 'booked' },
            { new: true }
        );

        if (!table) {
            return next(new appError('This table is not available or does not exist.', 404));
        }
    }

    // Create order items with proper structure
    const orderItems = items.map(item => ({
      menuItem: item.menuItem,
      hotelId: staff.hotelId,
      quantity: item.quantity,
      size: item.size,
      addons: item.addons || [],
      price: item.price,
    }));
    
    // Create new order
    const order = new Order({
      user: customerId || req.user._id, // Use customer ID if provided, otherwise use staff ID
      items: orderItems,
      totalAmount: totalAmount,
      paymentMethod,
      paymentStatus: paymentId ? 'completed' : 'pending',
      paymentId,
      tableNumber,
      specialInstructions,
      createdBy: {
        id: req.user._id,
        role: 'staff'
      }
    });
    
    await order.save();
    
    // Manually populate menu items from hotel
    const populatedItems = await Promise.all(order.items.map(async (item) => {
      let menuItemData = null;
      
      for (const category of hotel.menuCategories) {
        const menuItem = category.items.find(mi => mi.id === item.menuItem);
        if (menuItem) {
          menuItemData = {
            id: menuItem.id,
            title: menuItem.title,
            image: menuItem.image,
            description: menuItem.description,
            price: menuItem.price,
            category: category.name
          };
          break;
        }
      }
      
      const itemObject = (item as any).toObject();
      return {
        ...itemObject,
        menuItemData
      };
    }));
    
    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Order created successfully",
      data: {
        ...order.toObject(),
        items: populatedItems
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders for staff's hotel
export const getStaffHotelOrders = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is staff
    if (req.user.role !== 'staff') {
       next(new appError("Access denied", 403));
       return;
    }
    
    // Get staff details with hotel
    const staff = await Staff.findById(req.user._id);
    if (!staff) {
       next(new appError("Staff not found", 404));
       return;
    }
    
    // Get orders for the hotel
    const orders = await Order.find({
      "items.hotelId": staff.hotelId
    }).sort({ createdAt: -1 }).populate('user', 'name phone email');

    // console.log("orders", orders)
    
    
    if (orders.length === 0) {
       res.status(200).json({
        success: true,
        statusCode: 200,
        message: "No orders found",
        data: []
      });
      return;
    }
    
    // Get hotel for menu item details
    const hotel = await Hotel.findOne({ 
      _id: staff.hotelId, 
      isDeleted: false 
    });

    // console.log("hotel check", hotel)
    
    if (!hotel) {
       next(new appError("Hotel not found", 404));
       return;
    }
    


        
    // Manually populate menu items from hotel
const populatedOrders = await Promise.all(orders.map(async (order) => {
  const populatedItems = await Promise.all(order.items.map(async (item) => {
    let menuItemData = null;

    for (const category of hotel.menuCategories) {
      // Try to match by both ID and title (case-insensitive)
      const menuItem = category.items.find(mi => 
        mi.id === item.menuItem || 
        mi.title?.toLowerCase() === item.menuItem?.toLowerCase() ||
        mi._id?.toString() === item.menuItem
      );
      
      if (menuItem) {
        menuItemData = {
          id: menuItem.id || menuItem._id,
          title: menuItem.title,
          image: menuItem.image,
          description: menuItem.description,
          price: menuItem.price,
          category: category.name
        };
        break;
      }
    }
    
    const itemObject = (item as any).toObject();
    return {
      ...itemObject,
      menuItemData
    };
  }));

  return {
    ...order.toObject(),
    items: populatedItems
  };
}));


    // console.log('populated item data', populatedOrders)
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Orders retrieved successfully",
      data: populatedOrders
    });
  } catch (error) {
    next(error);
  }
};

// Update order status (staff only)
export const updateStaffOrderStatus = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = updateOrderStatusValidation.parse(req.body);
    
    // Check if user is staff
    if (req.user.role !== 'staff') {
      return next(new appError("Access denied", 403));
    }
    
    // Get staff details with hotel
    const staff = await Staff.findById(req.user._id);
    if (!staff) {
      return next(new appError("Staff not found", 404));
    }
    
    // Find order and check if it belongs to staff's hotel
    const order = await Order.findOne({
      _id: req.params.id,
      "items.hotelId": staff.hotelId
    });
    
    if (!order) {
      return next(new appError("Order not found or you don't have permission to update it", 404));
    }
    
    // if order has table number and status is delivered or cancelled, make table available
    if (order.tableNumber && (status === 'delivered' || status === 'cancelled')) {
        await QRCode.findOneAndUpdate(
            { hotelId: staff.hotelId, tableNumber: order.tableNumber, isDeleted: false },
            { status: 'available' }
        );
    }
    
    // Update order status
    order.status = status;
    await order.save();
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Order status updated successfully",
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Get order details (staff only)
export const getStaffOrderDetails = async (
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
    
    // Find order and check if it belongs to staff's hotel
    const order = await Order.findOne({
      _id: req.params.id,
      "items.hotelId": staff.hotelId
    }).populate('user', 'name phone email');
    
    if (!order) {
      return next(new appError("Order not found or you don't have permission to view it", 404));
    }
    
    // Get hotel for menu item details
    const hotel = await Hotel.findOne({ 
      _id: staff.hotelId, 
      isDeleted: false 
    });
    
    if (!hotel) {
      return next(new appError("Hotel not found", 404));
    }
    
    // Manually populate menu items from hotel
    const populatedItems = await Promise.all(order.items.map(async (item) => {
      let menuItemData = null;
      
      for (const category of hotel.menuCategories) {
        const menuItem = category.items.find(mi => mi.id === item.menuItem);
        if (menuItem) {
          menuItemData = {
            id: menuItem.id,
            title: menuItem.title,
            image: menuItem.image,
            description: menuItem.description,
            price: menuItem.price,
            category: category.name
          };
          break;
        }
      }
      
      const itemObject = (item as any).toObject();
      return {
        ...itemObject,
        menuItemData
      };
    }));
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Order retrieved successfully",
      data: {
        ...order.toObject(),
        items: populatedItems
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateStaffOrder = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id;
    const validatedData = staffOrderUpdateValidation.parse(req.body);

    if (req.user.role !== 'staff') {
      return next(new appError("Access denied", 403));
    }
    
    const staff = await Staff.findById(req.user._id);
    if (!staff) {
      return next(new appError("Staff not found", 404));
    }
    
    const order = await Order.findOne({
      _id: orderId,
      "items.hotelId": staff.hotelId
    });

    if (!order) {
      return next(new appError("Order not found or you don't have permission to update it", 404));
    }

    // Case 1: Order is assigned a new table or table is changed
    if (validatedData.tableNumber && validatedData.tableNumber !== order.tableNumber) {
        // Release the old table
        if (order.tableNumber) {
            await QRCode.findOneAndUpdate(
                { hotelId: staff.hotelId, tableNumber: order.tableNumber, isDeleted: false },
                { status: 'available' }
            );
        }
        // Book the new table
        const newTable = await QRCode.findOneAndUpdate(
            { hotelId: staff.hotelId, tableNumber: validatedData.tableNumber, isDeleted: false, status: 'available' },
            { status: 'booked' },
            { new: true }
        );
        if (!newTable) {
            return next(new appError('The new table is not available or does not exist.', 400));
        }
    }

    // Case 2: Order status changes to delivered or cancelled
    if (validatedData.status && (validatedData.status === 'delivered' || validatedData.status === 'cancelled') && (validatedData.tableNumber || order.tableNumber)) {
        await QRCode.findOneAndUpdate(
            { hotelId: staff.hotelId, tableNumber: validatedData.tableNumber || order.tableNumber, isDeleted: false },
            { status: 'available' }
        );
    }

    // If items are being updated, manually add the hotelId to each item
    if (validatedData.items) {
        const itemsWithHotelId = validatedData.items.map(item => ({
            ...item,
            hotelId: staff.hotelId,
        }));
        // Update items separately
        order.items = itemsWithHotelId as any; 
        delete (validatedData as any).items;
    }
    
    // Update other order fields
    order.set(validatedData);

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Order updated successfully",
      data: updatedOrder
    });

  } catch (error) {
    next(error);
  }
};