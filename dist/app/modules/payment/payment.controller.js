"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyGenericPayment = exports.createGenericPaymentOrder = exports.verifyPackagePayment = exports.createPackagePaymentOrder = exports.verifyRazorpayPayment = exports.createRazorpayOrder = void 0;
const order_model_1 = require("../order/order.model");
const cart_model_1 = require("../cart/cart.model");
const hotel_model_1 = require("../hotel/hotel.model");
const razorpay_1 = __importDefault(require("razorpay"));
const qrcode_model_1 = require("../qrcode/qrcode.model");
const appError_1 = require("../../errors/appError");
// Initialize Razorpay
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});
const createRazorpayOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
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
            const razorpayOrder = yield razorpay.orders.create({
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
            cart = yield cart_model_1.Cart.findOne({ tableIdentifier });
            console.log("PAYMENT - Found shared cart:", cart ? "Yes" : "No");
            if (!cart) {
                // Create a new shared cart if none exists
                cart = new cart_model_1.Cart({
                    tableIdentifier,
                    users: [userId],
                    items: [],
                    totalAmount: 0,
                    discountAmount: 0,
                });
                yield cart.save();
            }
            else if (!((_a = cart.users) === null || _a === void 0 ? void 0 : _a.includes(userId))) {
                // Add user to existing shared cart
                if (!cart.users)
                    cart.users = [];
                cart.users.push(userId);
                yield cart.save();
            }
        }
        else {
            // Fallback to personal cart
            console.log("PAYMENT - No hotelId/tableNumber provided, using personal cart");
            cart = yield cart_model_1.Cart.findOne({ user: userId });
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
        const cartHotelId = (_b = cart.items[0]) === null || _b === void 0 ? void 0 : _b.hotelId;
        if (!cartHotelId) {
            res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Hotel information not found in cart."
            });
            return;
        }
        const hotel = yield hotel_model_1.Hotel.findById(cartHotelId);
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
        const razorpayOrder = yield razorpay.orders.create({
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
    }
    catch (error) {
        next(error);
    }
});
exports.createRazorpayOrder = createRazorpayOrder;
const verifyRazorpayPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId // Expecting our internal order ID from the frontend
         } = req.body;
        if (!orderId) {
            next(new appError_1.appError("Order ID is required for verification", 400));
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
        const order = yield order_model_1.Order.findById(orderId);
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
        yield order.save();
        // After successful payment, mark the table as 'booked'
        if (order.tableNumber) {
            const hotelId = (_a = order.items[0]) === null || _a === void 0 ? void 0 : _a.hotelId;
            if (hotelId) {
                yield qrcode_model_1.QRCode.findOneAndUpdate({ hotelId: hotelId, tableNumber: order.tableNumber, isDeleted: false }, { status: 'booked' }, { new: true });
            }
        }
        // The cart has already been cleared by `createOrder`.
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Payment verified and order updated",
            data: order
        });
    }
    catch (error) {
        next(error);
    }
});
exports.verifyRazorpayPayment = verifyRazorpayPayment;
const createPackagePaymentOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const razorpayOrder = yield razorpay.orders.create({
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
    }
    catch (error) {
        next(error);
    }
});
exports.createPackagePaymentOrder = createPackagePaymentOrder;
// NEW METHOD: Verify package payment
const verifyPackagePayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, contractData // This will contain your contract form data
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
    }
    catch (error) {
        next(error);
    }
});
exports.verifyPackagePayment = verifyPackagePayment;
// Generic payment order creation
const createGenericPaymentOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, currency = 'INR', paymentType, metadata = {} } = req.body;
        if (!amount || amount <= 0) {
            res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Valid amount is required"
            });
            return;
        }
        // Create Razorpay order
        const razorpayOrder = yield razorpay.orders.create({
            amount: Math.round(Number(amount) * 100), // in paise
            currency: currency,
            receipt: `${paymentType || 'generic'}_${Date.now()}`,
            notes: Object.assign({ userId: req.user._id.toString(), paymentType: paymentType || 'generic' }, metadata)
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
    }
    catch (error) {
        next(error);
    }
});
exports.createGenericPaymentOrder = createGenericPaymentOrder;
// Generic payment verification
const verifyGenericPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentType, callbackData = {} } = req.body;
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
        let responseData = {
            paymentId: razorpayPaymentId,
            orderId: razorpayOrderId
        };
        // Handle different payment types
        switch (paymentType) {
            case 'cart':
                // Process cart payment (similar to verifyRazorpayPayment)
                const cart = yield cart_model_1.Cart.findOne({ user: req.user._id });
                if (!cart || cart.items.length === 0) {
                    res.status(400).json({
                        success: false,
                        statusCode: 400,
                        message: "Cart is empty"
                    });
                    return;
                }
                const order = new order_model_1.Order({
                    user: req.user._id,
                    items: cart.items,
                    totalAmount: cart.totalAmount,
                    address: callbackData.address,
                    paymentMethod: 'razorpay',
                    paymentStatus: 'paid',
                    paymentId: razorpayPaymentId
                });
                yield order.save();
                // Clear the cart
                cart.items = [];
                cart.totalAmount = 0;
                yield cart.save();
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
    }
    catch (error) {
        next(error);
    }
});
exports.verifyGenericPayment = verifyGenericPayment;
