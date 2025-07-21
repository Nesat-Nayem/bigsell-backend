import { NextFunction, Response } from "express";
import { userInterface } from "../../middlewares/userInterface";
import { Order } from "../order/order.model";
import { Cart } from "../cart/cart.model";
import { Hotel } from "../hotel/hotel.model";
import Razorpay from "razorpay";
import { QRCode } from "../qrcode/qrcode.model";
import { appError } from "../../errors/appError";
import { createRazorpayOrderValidation, verifyRazorpayPaymentValidation } from "./payment.validation";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});



export const createRazorpayOrder = async (
  req: userInterface, 
  res: Response, 
  next: NextFunction
) => {
  

  try {
    // Use the same cart finding logic as the order controller
    const hotelId = req.body.hotelId || req.query.hotelId;
    const tableNumber = req.body.tableNumber || req.query.tableNumber;
    const orderAmount = req.body.orderAmount; // Amount for selected items from frontend
    const userId = req.user._id;

    console.log("PAYMENT - createRazorpayOrder - hotelId:", hotelId, "tableNumber:", tableNumber, "userId:", userId);
    console.log("PAYMENT - orderAmount from frontend:", orderAmount);

    // If orderAmount is provided, use it directly (for selected items)
    if (orderAmount && orderAmount > 0) {
      console.log("PAYMENT - Using provided orderAmount:", orderAmount);
      
      // Validate orderAmount
      if (typeof orderAmount !== 'number' || orderAmount <= 0) {
        res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Invalid order amount provided"
        });
        return;
      }
      
      // Create Razorpay order with the provided amount
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(orderAmount * 100), // in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          userId: req.user._id.toString(),
          hotelId: hotelId || 'unknown',
          tableNumber: tableNumber || 'personal',
          type: 'selected_items'
        }
      });
      
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Razorpay order created for selected items",
        data: {
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency
        }
      });
      return;
    }

    // Fallback: calculate from cart (existing logic for backward compatibility)
    let cart;
    if (hotelId && tableNumber) {
      // Look for shared table cart
      const tableIdentifier = `${hotelId}_${tableNumber}`;
      console.log("PAYMENT - Looking for cart with tableIdentifier:", tableIdentifier);
      
      cart = await Cart.findOne({ tableIdentifier });
      console.log("PAYMENT - Found shared cart:", cart ? "Yes" : "No");

      if (!cart) {
        // Create a new shared cart if none exists
        cart = new Cart({
          tableIdentifier,
          users: [userId],
          items: [],
          totalAmount: 0,
          discountAmount: 0,
        });
        await cart.save();
      } else if (!cart.users?.includes(userId)) {
        // Add user to existing shared cart
        if (!cart.users) cart.users = [];
        cart.users.push(userId);
        await cart.save();
      }
    } else {
      // Fallback to personal cart
      console.log("PAYMENT - No hotelId/tableNumber provided, using personal cart");
      cart = await Cart.findOne({ user: userId });
    }
    
    if (!cart || cart.items.length === 0) {
       res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Cart is empty"
      });
      return;
    }
    
    // Get hotel info for taxes and service charge
    const cartHotelId = cart.items[0]?.hotelId;
    if (!cartHotelId) {
       res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Hotel information not found in cart."
      });
      return;
    }

    const hotel = await Hotel.findById(cartHotelId);
    if (!hotel) {
       res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Hotel not found."
      });
      return;
    }

    // Calculate the final amount including taxes and charges (fallback method)
    const subtotal = cart.totalAmount;
    const cgst = subtotal * ((hotel.cgstRate || 0) / 100);
    const sgst = subtotal * ((hotel.sgstRate || 0) / 100);
    const serviceCharge = subtotal * ((hotel.serviceCharge || 0) / 100);
    const totalAmount = subtotal + cgst + sgst + serviceCharge;
    const finalAmount = totalAmount - (cart.discountAmount || 0);
    
    console.log("PAYMENT - Using cart-calculated amount:", finalAmount);
    
    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100), // in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        hotelId: cartHotelId.toString(),
        tableNumber: tableNumber || 'personal',
        type: 'full_cart'
      }
    });
    
    
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Razorpay order created",
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency
      }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyRazorpayPayment = async (
  req: userInterface, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { 
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature,
      orderId // Expecting our internal order ID from the frontend
    } = req.body;
    
    if (!orderId) {
        next(new appError("Order ID is required for verification", 400));
        return;
    }

    // Verify the payment signature
    const crypto = require('crypto');
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');
    
    const isAuthentic = generatedSignature === razorpaySignature;
    
    if (!isAuthentic) {
       res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Payment verification failed: Invalid signature"
      });
      return;
    }
    
    // Find the pending order
    const order = await Order.findById(orderId);
    
    if (!order) {
       res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Order not found"
      });
      return;
    }


    // Update the order with payment details
    order.paymentStatus = 'paid';
    order.status = 'processing';
    order.paymentId = razorpayPaymentId;
    // Add payment details if not already there from createOrder
    order.paymentDetails = {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    };
    
    await order.save();

    // After successful payment, mark the table as 'booked'
    if (order.tableNumber) {
        const hotelId = order.items[0]?.hotelId;
        if (hotelId) {
            await QRCode.findOneAndUpdate(
                { hotelId: hotelId, tableNumber: order.tableNumber, isDeleted: false },
                { status: 'booked' },
                { new: true }
            );
        }
    }
    
    // The cart has already been cleared by `createOrder`.
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Payment verified and order updated",
      data: order
    });
  } catch (error) {
    next(error);
  }
};


export const createPackagePaymentOrder = async (
  req: userInterface, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { orderAmount, packageName } = req.body;
    
    if (!orderAmount) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Order amount is required"
      });
      return;
    }
    
    // Create Razorpay order without checking cart
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(orderAmount * 100), // in paise
      currency: 'INR',
      receipt: `pkg_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        packageName: packageName || 'Package Purchase'
      }
    });
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Razorpay order created for package",
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency
      }
    });
  } catch (error) {
    next(error);
  }
};

// NEW METHOD: Verify package payment
export const verifyPackagePayment = async (
  req: userInterface, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { 
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature,
      contractData  // This will contain your contract form data
    } = req.body;
    
    // Verify the payment signature (same as in verifyRazorpayPayment)
    const crypto = require('crypto');
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');
    
    const isAuthentic = generatedSignature === razorpaySignature;
    
    if (!isAuthentic) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Payment verification failed"
      });
      return;
    }
    
    // Payment is valid! You can create a contract record here if needed
    // (This is just a response - you'll handle contract creation from the frontend)
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Package payment verified successfully",
      data: {
        paymentId: razorpayPaymentId,
        orderId: razorpayOrderId
      }
    });
  } catch (error) {
    next(error);
  }
};

// Generic payment order creation
export const createGenericPaymentOrder = async (
  req: userInterface, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { 
      amount, 
      currency = 'INR', 
      paymentType, 
      metadata = {} 
    } = req.body;
    
    if (!amount || amount <= 0) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Valid amount is required"
      });
      return;
    }
    
    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100), // in paise
      currency: currency,
      receipt: `${paymentType || 'generic'}_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        paymentType: paymentType || 'generic',
        ...metadata
      }
    });
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Payment order created successfully",
      data: {
        orderId: razorpayOrder.id,
        amount: Number(razorpayOrder.amount) / 100, // Convert back to main currency unit
        currency: razorpayOrder.currency,
        paymentType: paymentType || 'generic'
      }
    });
  } catch (error) {
    next(error);
  }
};
// Generic payment verification
export const verifyGenericPayment = async (
  req: userInterface, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { 
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature,
      paymentType,
      callbackData = {}
    } = req.body;
    
    // Verify the payment signature
    const crypto = require('crypto');
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');
    
    const isAuthentic = generatedSignature === razorpaySignature;
    
    if (!isAuthentic) {
       res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Payment verification failed"
      });
      return;
    }
    
    // Payment is verified, now handle different payment types
    let responseData: { 
      paymentId: any; 
      orderId: any;
      orderDetails?: any;
    } = {
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId
    };
    
    // Handle different payment types
    switch(paymentType) {
      case 'cart':
        // Process cart payment (similar to verifyRazorpayPayment)
        const cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart || cart.items.length === 0) {
          res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Cart is empty"
          });
          return;
        }
        
        const order = new Order({
          user: req.user._id,
          items: cart.items,
          totalAmount: cart.totalAmount,
          address: callbackData.address,
          paymentMethod: 'razorpay',
          paymentStatus: 'paid',
          paymentId: razorpayPaymentId
        });
        
        await order.save();
        
        // Clear the cart
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();
        
        responseData.orderDetails = order;
        break;
        
      case 'package':
        // Process package payment (no additional processing needed)
        break;
        
      case 'table-booking':
        // Process table booking payment
        // You can add specific logic for table booking here
        break;
        
      // Add more payment types as needed
        
      default:
        // Generic payment with no specific processing
        break;
    }
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Payment for ${paymentType || 'transaction'} verified successfully`,
      data: responseData
    });
  } catch (error) {
    next(error);
  }
};