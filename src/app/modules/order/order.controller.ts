import { NextFunction, Response } from "express";
import { Order } from "./order.model";
import { Cart } from "../cart/cart.model";
import { Hotel } from "../hotel/hotel.model";
import { QRCode } from "../qrcode/qrcode.model";
import { createOrderValidation, updateOrderStatusValidation, updatePaymentStatusValidation } from "./order.validation";
import { appError } from "../../errors/appError";
import { userInterface } from "../../middlewares/userInterface";
import { Coupon } from "../coupon/coupon.model";
import { IOrder, IOrderItem } from "./order.interface";
import mongoose from "mongoose";

// Helper function to get the correct cart (personal or shared table cart)
const getCartForRequest = async (req: userInterface) => {
    // Check body, then query for table info
    const hotelId = req.body.hotelId || req.query.hotelId;
    const tableNumber = req.body.tableNumber || req.query.tableNumber;
    const userId = req.user._id;

    console.log("ORDER - getCartForRequest - hotelId:", hotelId, "tableNumber:", tableNumber, "userId:", userId);

    if (hotelId && tableNumber) {
        const tableIdentifier = `${hotelId}_${tableNumber}`;
        console.log("ORDER - Looking for cart with tableIdentifier:", tableIdentifier);
        
        let cart = await Cart.findOne({ tableIdentifier });
        console.log("ORDER - Found cart:", cart ? "Yes" : "No");

        if (!cart) {
            console.log("ORDER - No cart found for table");
            return null; // For orders, we don't create a new cart if none exists
        } else {
            // Add user to the shared cart if they aren't already in it
            if (!cart.users) {
                cart.users = [];
            }
            if (!cart.users.find(u => u.equals(userId))) {
                cart.users.push(userId);
                console.log("ORDER - Added user to existing cart");
            }
        }
        return cart;
    } else {
        console.log("ORDER - No hotelId/tableNumber provided, using personal cart");
        // Fallback to personal cart for users not at a table
        let cart = await Cart.findOne({ user: userId });
        return cart;
    }
};

// Helper function to populate menu item data
const populateOrderItems = async (order: IOrder) => {
  const populatedItems = await Promise.all(
    order.items.map(async (item: IOrderItem) => {
      const hotel = await Hotel.findById(item.hotelId);
      let menuItemData = null;

      if (hotel) {
        for (const category of hotel.menuCategories) {
          const menuItem = category.items.find((mi) => mi.id === item.menuItem);
          if (menuItem) {
            menuItemData = {
              id: menuItem.id,
              title: menuItem.title,
              image: menuItem.image,
              description: menuItem.description,
              price: menuItem.price,
              category: category.name,
            };
            break;
          }
        }
      }

      return {
        ...(item as any).toObject(),
        menuItemData,
      };
    })
  );

  const populatedOrder = await Order.populate(order, [
    { path: "users", select: "name phone" },
    { path: "items.orderedBy", select: "name phone" },
  ]);

  return {
    ...populatedOrder.toObject(),
    items: populatedItems,
  };
};

// Create a new order from cart
export const createOrder = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { hotelId: reqHotelId, tableNumber, paymentMethod, paymentId, specialInstructions, selectedItemIds } =
      createOrderValidation.parse(req.body);

    console.log("ORDER - createOrder called with:", { reqHotelId, tableNumber, paymentMethod, selectedItemIds });

    // Use the same cart finding logic as the cart controller
    const cart = await getCartForRequest(req);

    if (!cart || cart.items.length === 0) {
       console.log("ORDER - Cart is empty or not found");
       next(new appError("Cart is empty", 400));
      return;
    }

    console.log("ORDER - Found cart with", cart.items.length, "items");
    console.log("ORDER - Cart type:", cart.tableIdentifier ? "shared table cart" : "personal cart");
    console.log("ORDER - Cart items:", cart.items.map(item => ({ id: item._id?.toString(), menuItem: item.menuItem, orderedBy: item.orderedBy })));

    // Filter items based on selection
    let itemsToOrder = cart.items;
    if (selectedItemIds && selectedItemIds.length > 0) {
      console.log("ORDER - Filtering items. Selected IDs:", selectedItemIds);
      console.log("ORDER - Available cart item IDs:", cart.items.map(item => item._id?.toString()));
      
      itemsToOrder = cart.items.filter(item => {
        const itemIdStr = item._id?.toString();
        const isSelected = itemIdStr && selectedItemIds.includes(itemIdStr);
        console.log(`ORDER - Item ${itemIdStr}: ${isSelected ? 'SELECTED' : 'NOT SELECTED'}`);
        return isSelected;
      });
      
      console.log("ORDER - Filtered to", itemsToOrder.length, "selected items");
      console.log("ORDER - Items to order:", itemsToOrder.map(item => ({ id: item._id?.toString(), menuItem: item.menuItem })));
      
      if (itemsToOrder.length === 0) {
        next(new appError("No valid selected items found in cart", 400));
        return;
      }
    }

    // Calculate total for selected items only
    const selectedSubtotal = itemsToOrder.reduce((sum, item) => sum + item.price, 0);
    
    // Get hotel details
    const hotelId = reqHotelId || cart.items[0].hotelId;
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
       next(new appError("Hotel details not found for this order.", 404));
      return;
    }

    // --- SHARED TABLE LOGIC ---
    // If a table number is provided, check for an existing active order
    if (tableNumber) {
      const existingOrder = await Order.findOne({
        tableNumber: tableNumber,
        status: { $nin: ["delivered", "cancelled"] },
      });

      // If an active order exists, merge the cart into it
      if (existingOrder) {
        // Add current user to the order if they are not already part of it
        (existingOrder.users as any).addToSet(req.user._id);

        // Add items from cart to the existing order (only selected items)
        const newItems = itemsToOrder.map((item) => ({
          menuItem: item.menuItem,
          hotelId: item.hotelId,
          quantity: item.quantity,
          size: item.size,
          addons: item.addons,
          price: item.price,
          specialInstructions: item.specialInstructions || "",
          orderedBy: req.user._id,
          status: "pending" as "pending" | "preparing" | "served" | "cancelled",
          paymentMethod: paymentMethod as 'cash' | 'razorpay' | 'manual',
          itemPaymentStatus: paymentMethod === 'razorpay' ? 'paid' : 'pending' as 'pending' | 'paid',
        }));
        existingOrder.items.push(...newItems);

        // Recalculate totals (using selected items subtotal)
        const subtotalOfNewItems = selectedSubtotal;
        existingOrder.subtotal += subtotalOfNewItems;
        existingOrder.discountAmount = (existingOrder.discountAmount || 0) + (cart.discountAmount || 0);
        
        existingOrder.cgstAmount = existingOrder.subtotal * ((hotel.cgstRate || 0) / 100);
        existingOrder.sgstAmount = existingOrder.subtotal * ((hotel.sgstRate || 0) / 100);
        existingOrder.serviceCharge = existingOrder.subtotal * ((hotel.serviceCharge || 0) / 100);

        existingOrder.totalAmount =
          existingOrder.subtotal +
          existingOrder.cgstAmount +
          existingOrder.sgstAmount +
          (existingOrder.serviceCharge || 0) -
          (existingOrder.discountAmount || 0);

        // Recalculate total amount paid based on all items
        const totalPaid = existingOrder.items.reduce((acc, item) => {
            return item.itemPaymentStatus === 'paid' ? acc + item.price : acc;
        }, 0);
        
        const totalCgst = totalPaid * ((hotel.cgstRate || 0) / 100);
        const totalSgst = totalPaid * ((hotel.sgstRate || 0) / 100);
        
        // Calculate proportional service charge for paid items
        const serviceChargeForPaid = existingOrder.subtotal > 0 ? (totalPaid / existingOrder.subtotal) * (existingOrder.serviceCharge || 0) : 0;
        
        existingOrder.amountPaid = totalPaid + totalCgst + totalSgst + serviceChargeForPaid;

        if (existingOrder.amountPaid >= existingOrder.totalAmount) {
          existingOrder.paymentStatus = "paid";
        } else if (existingOrder.amountPaid > 0) {
          existingOrder.paymentStatus = "partially-paid";
        } else {
          existingOrder.paymentStatus = "pending";
        }


        await existingOrder.save();

        // Handle cart cleanup for existing order
        if (selectedItemIds && selectedItemIds.length > 0) {
          // Remove only the selected items from cart
          console.log("ORDER - Removing", selectedItemIds.length, "selected items from existing order cart");
          console.log("ORDER - Cart items before filtering:", cart.items.length);
          console.log("ORDER - Items to remove:", selectedItemIds);
          
          cart.items = cart.items.filter(item => {
            const itemIdStr = item._id?.toString();
            const shouldKeep = !itemIdStr || !selectedItemIds.includes(itemIdStr);
            console.log(`ORDER - Item ${itemIdStr}: ${shouldKeep ? 'KEEPING' : 'REMOVING'}`);
            return shouldKeep;
          });
          
          console.log("ORDER - Cart items after filtering:", cart.items.length);
          
          // Recalculate cart total
          cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price, 0);
          
          // If no items left, delete the cart entirely, otherwise save it
          if (cart.items.length === 0) {
            if (cart.tableIdentifier) {
              console.log("ORDER - Deleting empty shared cart with tableIdentifier:", cart.tableIdentifier);
              await Cart.findOneAndDelete({ tableIdentifier: cart.tableIdentifier });
            } else {
              console.log("ORDER - Deleting empty personal cart for user:", req.user._id);
              await Cart.findOneAndDelete({ user: req.user._id });
            }
          } else {
            console.log("ORDER - Saving updated cart with", cart.items.length, "remaining items");
            await cart.save();
          }
        } else {
          // No selection provided, clear the entire cart (fallback behavior)
          if (cart.tableIdentifier) {
            console.log("ORDER - Clearing shared cart with tableIdentifier:", cart.tableIdentifier);
            await Cart.findOneAndDelete({ tableIdentifier: cart.tableIdentifier });
          } else {
            console.log("ORDER - Clearing personal cart for user:", req.user._id);
            await Cart.findOneAndDelete({ user: req.user._id });
          }
        }
        
        const populatedOrder = await populateOrderItems(existingOrder);

         res.status(200).json({
          success: true,
          statusCode: 200,
          message: "Joined table and added items to order successfully",
          data: populatedOrder,
        });
        return;
      }
    }

    // --- CREATE NEW ORDER LOGIC ---
    // Calculate amounts (using selected items)
    const subtotal = selectedSubtotal;
    const cgstAmount = subtotal * ((hotel.cgstRate || 0) / 100);
    const sgstAmount = subtotal * ((hotel.sgstRate || 0) / 100);
    const serviceChargeAmount = subtotal * ((hotel.serviceCharge || 0) / 100);
    const totalAmount = subtotal + cgstAmount + sgstAmount + serviceChargeAmount;
    const finalAmount = totalAmount - (cart.discountAmount || 0);
    
    const newOrderItems = itemsToOrder.map((item) => ({
        menuItem: item.menuItem,
        hotelId: item.hotelId,
        quantity: item.quantity,
        size: item.size,
        addons: item.addons,
        price: item.price,
        specialInstructions: item.specialInstructions || "",
        orderedBy: req.user._id,
        status: "pending" as "pending" | "preparing" | "served" | "cancelled",
        paymentMethod: paymentMethod as 'cash' | 'razorpay' | 'manual',
        itemPaymentStatus: paymentMethod === 'razorpay' ? 'paid' : 'pending' as 'pending' | 'paid',
    }));

    
    const subtotalFromItems = newOrderItems.reduce((acc, item) => acc + item.price, 0);
    const cgstForItems = subtotalFromItems * ((hotel.cgstRate || 0) / 100);
    const sgstForItems = subtotalFromItems * ((hotel.sgstRate || 0) / 100);

    const amountPaid = newOrderItems.reduce((acc, item) => {
        return item.itemPaymentStatus === 'paid' ? acc + item.price : acc;
    }, 0);
    
    const cgstForPaid = amountPaid * ((hotel.cgstRate || 0) / 100);
    const sgstForPaid = amountPaid * ((hotel.sgstRate || 0) / 100);
    
    // Calculate proportional service charge for paid items
    const serviceChargeForPaid = subtotal > 0 ? (amountPaid / subtotal) * serviceChargeAmount : 0;
    
    const totalAmountPaid = amountPaid + cgstForPaid + sgstForPaid + serviceChargeForPaid;

    const order = new Order({
      users: [req.user._id],
      items: newOrderItems,
      subtotal,
      cgstAmount,
      sgstAmount,
      serviceCharge: serviceChargeAmount,
      totalAmount: finalAmount,
      amountPaid: totalAmountPaid,
      couponCode: cart.appliedCouponCode,
      discountAmount: cart.discountAmount,
      paymentMethod,
      paymentStatus:
        totalAmountPaid >= finalAmount
          ? "paid"
          : totalAmountPaid > 0 
          ? "partially-paid"
          : "pending",
      status: "pending" as "pending" | "preparing" | "served" | "cancelled",
      paymentDetails: req.body.paymentDetails || {},
      tableNumber,
      specialInstructions,
    });

    await order.save();

    // After creating the order, update coupon usage
    if (order.couponCode) {
      const coupon = await Coupon.findOne({ couponCode: order.couponCode });
      if (coupon) {
        coupon.totalUses += 1;
        coupon.usedBy.push(req.user._id);
        await coupon.save();
      }
    }
    
    // Mark table as booked
    if (tableNumber) {
      await QRCode.findOneAndUpdate(
        { hotelId: hotel._id, tableNumber: tableNumber, isDeleted: false },
        { status: "booked" },
        { new: true }
      );
    }

    // Handle cart cleanup after creating the order
    if (selectedItemIds && selectedItemIds.length > 0) {
      // Remove only the selected items from cart
      console.log("ORDER - Removing", selectedItemIds.length, "selected items from cart");
      console.log("ORDER - Cart items before filtering:", cart.items.length);
      console.log("ORDER - Items to remove:", selectedItemIds);
      
      cart.items = cart.items.filter(item => {
        const itemIdStr = item._id?.toString();
        const shouldKeep = !itemIdStr || !selectedItemIds.includes(itemIdStr);
        console.log(`ORDER - Item ${itemIdStr}: ${shouldKeep ? 'KEEPING' : 'REMOVING'}`);
        return shouldKeep;
      });
      
      console.log("ORDER - Cart items after filtering:", cart.items.length);
      
      // Recalculate cart total
      cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price, 0);
      
      // If no items left, delete the cart entirely, otherwise save it
      if (cart.items.length === 0) {
        if (cart.tableIdentifier) {
          console.log("ORDER - Deleting empty shared cart with tableIdentifier:", cart.tableIdentifier);
          await Cart.findOneAndDelete({ tableIdentifier: cart.tableIdentifier });
        } else {
          console.log("ORDER - Deleting empty personal cart for user:", req.user._id);
          await Cart.findOneAndDelete({ user: req.user._id });
        }
      } else {
        console.log("ORDER - Saving updated cart with", cart.items.length, "remaining items");
        await cart.save();
      }
    } else {
      // No selection provided, clear the entire cart (fallback behavior)
      if (cart.tableIdentifier) {
        console.log("ORDER - Clearing shared cart with tableIdentifier:", cart.tableIdentifier);
        await Cart.findOneAndDelete({ tableIdentifier: cart.tableIdentifier });
      } else {
        console.log("ORDER - Clearing personal cart for user:", req.user._id);
        await Cart.findOneAndDelete({ user: req.user._id });
      }
    }

    const populatedOrder = await populateOrderItems(order);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Order created successfully",
      data: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders for the current user
export const getUserOrders = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await Order.find({ users: req.user._id })
      .sort({ createdAt: -1 });
    
    if (orders.length === 0) {
       res.status(200).json({
        success: true,
        statusCode: 200,
        message: "No orders found",
        data: []
      });
      return;
    }
    
    // Manually populate menu items from hotels for each order
    const populatedOrders = await Promise.all(orders.map(async (order) => {
      const populatedItems = await Promise.all(order.items.map(async (item) => {
        const hotel = await Hotel.findById(item.hotelId);
        let menuItemData = null;
        
        if (hotel) {
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
        }
        
        return {
          ...(item as any).toObject(),
          menuItemData
        };
      }));
      
      return {
        ...order.toObject(),
        items: populatedItems
      };
    }));
    
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

// Get a specific order by ID
export const getOrderById = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    let matchCondition: any = { _id: orderId };
    
    // If user is not admin, add additional filters
    if (userRole !== 'admin') {
      if (userRole === 'vendor') {
        // For vendors, check if order contains items from their hotels
        const vendorHotels = await Hotel.find({ 
          vendorId: userId, 
          isDeleted: false 
        }).select('_id');
        
        const hotelIds = vendorHotels.map(hotel => hotel._id);
        matchCondition['items.hotelId'] = { $in: hotelIds };
      } else {
        // For regular users, only show their own orders
        matchCondition.users = userId;
      }
    }
    
    const order = await Order.findOne(matchCondition)
      .populate({
        path: 'users',
        select: 'name phone email'
      });
    
    if (!order) {
      return next(new appError("Order not found or you don't have permission to view it", 404));
    }
    
    // Manually populate menu items from hotels
    const populatedItems = await Promise.all(order.items.map(async (item) => {
      const hotel = await Hotel.findById(item.hotelId);
      let menuItemData = null;
      
      if (hotel) {
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
      }
      
      
      return {
        ...(item as any).toObject(),
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

// Update order status (Admin only)
export const updateOrderStatus = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = updateOrderStatusValidation.parse(req.body);
    const orderId = req.params.id;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    let matchCondition: any = { _id: orderId };
    
    // If user is not admin, add additional filters
    if (userRole !== 'admin') {
      if (userRole === 'vendor') {
        // For vendors, check if order contains items from their hotels
        const vendorHotels = await Hotel.find({ 
          vendorId: userId, 
          isDeleted: false 
        }).select('_id');
        
        const hotelIds = vendorHotels.map(hotel => hotel._id);
        matchCondition['items.hotelId'] = { $in: hotelIds };
      } else {
        return next(new appError("Unauthorized to update order status", 403));
      }
    }
    
    const order = await Order.findOne(matchCondition);
    
    if (!order) {
      return next(new appError("Order not found or you don't have permission to update it", 404));
    }
    
    order.status = status;
    await order.save();

    // If order is delivered or cancelled, make the table available again
    if ((status === 'delivered' || status === 'cancelled') && order.tableNumber && order.items.length > 0) {
        const hotelId = order.items[0].hotelId;
        if (hotelId) {
            await QRCode.findOneAndUpdate(
                { hotelId: hotelId, tableNumber: order.tableNumber, isDeleted: false },
                { status: 'available' },
                { new: true }
            );
        }
    }
    
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

// Update payment status
export const updatePaymentStatus = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { paymentStatus } = updatePaymentStatusValidation.parse(req.body);
    
    const order = await Order.findOne({
      _id: req.params.id,
      users: req.user._id
    });
    
    if (!order) {
      return next(new appError("Order not found", 404));
    }
    
    order.paymentStatus = paymentStatus;
    
    // If payment is completed via Razorpay, update table status to 'booked'
    if (order.paymentMethod === 'razorpay' && paymentStatus === 'paid' && order.tableNumber) {
      const hotel = await Hotel.findById(order.items[0].hotelId);
      if (hotel) {
        await QRCode.findOneAndUpdate(
          { hotelId: hotel._id, tableNumber: order.tableNumber, isDeleted: false },
          { status: 'booked' },
          { new: true }
        );
      }
    }
    
    await order.save();
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Payment status updated successfully",
      data: order
    });
    
  } catch (error) {
    next(error);
  }
};

// Get dashboard statistics
export const getDashboardStats = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    let matchCondition: any = {};
    
    // If vendor, only show stats for their hotels' orders
    if (userRole === 'vendor') {
      // Get vendor's hotels
      const vendorHotels = await Hotel.find({ 
        vendorId: userId, 
        isDeleted: false 
      }).select('_id');
      
      const hotelIds = vendorHotels.map(hotel => hotel._id);
      matchCondition = { 'items.hotelId': { $in: hotelIds } };
    }
    
    // Get total orders
    const totalOrders = await Order.countDocuments(matchCondition);
    
    // Get orders by status
    const [pendingOrders, processingOrders, completedOrders] = await Promise.all([
      Order.countDocuments({ ...matchCondition, status: 'pending' }),
      Order.countDocuments({ ...matchCondition, status: 'processing' }),
      Order.countDocuments({ ...matchCondition, status: 'delivered' })
    ]);
    
    // Get total revenue
    const revenueResult = await Order.aggregate([
      { $match: { ...matchCondition, paymentStatus: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    
    // Get monthly revenue for the last 12 months
    const monthlyRevenue = await Order.aggregate([
      { 
        $match: { 
          ...matchCondition,
          paymentStatus: 'completed',
          createdAt: { 
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) 
          }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $project: {
          month: {
            $dateToString: {
              format: '%Y-%m',
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month'
                }
              }
            }
          },
          revenue: 1,
          orders: 1
        }
      },
      { $sort: { month: 1 } }
    ]);
    
    let topMenuItems :any[] = [];
    
    // Get top menu items for vendors
    if (userRole === 'vendor') {
      const vendorHotels = await Hotel.find({ 
        vendorId: userId, 
        isDeleted: false 
      });
      
      // Get all menu items from vendor's hotels
      const allMenuItems: any[] = [];
      vendorHotels.forEach(hotel => {
        hotel.menuCategories.forEach(category => {
          category.items.forEach(item => {
            allMenuItems.push({
              id: item.id,
              title: item.title,
              image: item.image,
              hotelId: hotel._id
            });
          });
        });
      });
      
      // Get order statistics for these menu items
      const menuItemStats = await Order.aggregate([
        { $match: matchCondition },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.menuItem',
            totalOrders: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.price' }
          }
        },
        { $sort: { totalOrders: -1 } },
        { $limit: 5 }
      ]);
      
      
      topMenuItems = menuItemStats.map(stat => {
        const menuItem = allMenuItems.find(item => item.id === stat._id);
        return {
          id: stat._id,
          title: menuItem?.title || 'Unknown Item',
          image: menuItem?.image || '',
          totalOrders: stat.totalOrders,
          totalRevenue: stat.totalRevenue
        };
      }).filter(item => item.title !== 'Unknown Item');
    }
    
    const responseData: any = {
      totalOrders,
      totalRevenue,
      pendingOrders,
      processingOrders,
      completedOrders,
      monthlyRevenue
    };
    
    if (userRole === 'vendor') {
      responseData.topMenuItems = topMenuItems;
    }
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Dashboard statistics retrieved successfully",
      data: responseData
    });
    
  } catch (error) {
    next(error);
  }
};

// Get all orders (Admin only)
export const getAllOrders = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Get query parameters
    const { 
      page = 1, 
      limit = 10, 
      status, 
      paymentStatus 
    } = req.query;
    
    let matchCondition: any = {};
    
    // If vendor, only show orders for their hotels
    if (userRole === 'vendor') {
      const vendorHotels = await Hotel.find({ 
        vendorId: userId, 
        isDeleted: false 
      }).select('_id');
      
      const hotelIds = vendorHotels.map(hotel => hotel._id);
      matchCondition = { 'items.hotelId': { $in: hotelIds } };
    }
    
    // Add filters
    if (status) {
      matchCondition.status = status;
    }
    
    if (paymentStatus) {
      matchCondition.paymentStatus = paymentStatus;
    }
    
    // Calculate pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;
    
    // Get total count
    const total = await Order.countDocuments(matchCondition);
    
    // Get orders with pagination
    const orders = await Order.find(matchCondition)
      .populate({
        path: 'users',
        select: 'name phone email'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    if (orders.length === 0) {
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: "No orders found",
        data: {
          orders: [],
          pagination: {
            total: 0,
            page: pageNum,
            limit: limitNum,
            pages: 0
          }
        }
      });
      return;
    }
    
    // Manually populate menu items from hotels for each order
    const populatedOrders = await Promise.all(orders.map(async (order) => {
      const populatedItems = await Promise.all(order.items.map(async (item) => {
        const hotel = await Hotel.findById(item.hotelId);
        let menuItemData = null;
        
        if (hotel) {
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
        }
        
        return {
          ...(item as any).toObject(),
          menuItemData
        };
      }));
      
      return {
        ...order.toObject(),
        items: populatedItems
      };
    }));
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Orders retrieved successfully",
      data: {
        orders: populatedOrders,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: totalPages
        }
      }
    });
    
  } catch (error) {
    next(error);
  }
};

export const updateOrderItemStatus = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'preparing', 'served', 'cancelled'].includes(status)) {
      return next(new appError("Invalid status provided.", 400));
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return next(new appError("Order not found.", 404));
    }

    const item = order.items.find((item) => item._id!.toString() === itemId);

    if (!item) {
      return next(new appError("Item not found in this order.", 404));
    }

    item.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Order item status updated successfully.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const recordManualPayment = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return next(new appError("Invalid payment amount provided.", 400));
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return next(new appError("Order not found.", 404));
    }

    // The amount provided should already include taxes and service charge
    // as calculated by the frontend, so we add it directly
    order.amountPaid = (order.amountPaid || 0) + amount;
    order.paymentMethod = 'manual';

    if (order.amountPaid >= order.totalAmount) {
      order.paymentStatus = 'paid';
    } else {
      order.paymentStatus = 'partially-paid';
    }

    await order.save();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Payment recorded successfully.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const completeOrder = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return next(new appError("Order not found.", 404));
    }

    if (order.paymentStatus !== 'paid') {
      return next(new appError("Order must be fully paid before completion.", 400));
    }

    order.status = 'delivered'; 
    
    if (order.tableNumber && order.items.length > 0) {
        const hotelId = order.items[0].hotelId;
        await QRCode.findOneAndUpdate(
            { hotelId: hotelId, tableNumber: order.tableNumber, isDeleted: false },
            { status: 'available' },
            { new: true }
        );
    }

    await order.save();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Order completed and table is now available.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const payForItems = async (
  req: userInterface,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { itemIds, paymentDetails, paymentId } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return next(new appError("No items selected for payment.", 400));
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return next(new appError("Order not found.", 404));
    }
    const hotel = await Hotel.findById(order.items[0].hotelId);
     if (!hotel) {
      return next(new appError("Hotel details not found for this order.", 404));
    }

    if (!order.users.includes(req.user._id)) {
      return next(
        new appError("You are not authorized to pay for this order.", 403)
      );
    }

    let amountJustPaid = 0;
    order.items.forEach(item => {
        if (itemIds.includes(item._id!.toString()) && item.itemPaymentStatus === 'pending') {
            item.itemPaymentStatus = 'paid';
            item.paymentMethod = 'razorpay'; 
            amountJustPaid += item.price;
        }
    });

    if (amountJustPaid === 0) {
        return next(new appError("Selected items are already paid or invalid.", 400));
    }

    const cgstForPayment = amountJustPaid * ((hotel.cgstRate || 0) / 100);
    const sgstForPayment = amountJustPaid * ((hotel.sgstRate || 0) / 100);
    
    // Calculate proportional service charge for the items being paid
    const serviceChargeForPayment = order.subtotal > 0 ? (amountJustPaid / order.subtotal) * order.serviceCharge : 0;
    
    const totalAmountForThisPayment = amountJustPaid + cgstForPayment + sgstForPayment + serviceChargeForPayment;

    order.amountPaid = (order.amountPaid || 0) + totalAmountForThisPayment;

    if (paymentId && paymentDetails) {
        order.paymentId = paymentId;
        order.paymentDetails = paymentDetails;
    }

    if (order.amountPaid >= order.totalAmount) {
      order.paymentStatus = "paid";
    } else {
      order.paymentStatus = "partially-paid";
    }

    await order.save();
    const populatedOrder = await populateOrderItems(order);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Payment successful for selected items.",
      data: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};
