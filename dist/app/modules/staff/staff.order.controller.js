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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStaffOrder = exports.getStaffOrderDetails = exports.updateStaffOrderStatus = exports.getStaffHotelOrders = exports.createStaffOrder = void 0;
const order_model_1 = require("../order/order.model");
const hotel_model_1 = require("../hotel/hotel.model");
const qrcode_model_1 = require("../qrcode/qrcode.model");
// import { Staff } from "./staff.model";
const order_validation_1 = require("../order/order.validation");
const staff_order_validation_1 = require("./staff.order.validation");
const appError_1 = require("../../errors/appError");
const staff_model_1 = require("./staff.model");
// Create order for customer (staff only)
const createStaffOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request body
        const { paymentMethod, paymentId, items, customerId, totalAmount, tableNumber, specialInstructions } = staff_order_validation_1.staffOrderCreateValidation.parse(req.body);
        // Check if user is staff
        if (req.user.role !== 'staff') {
            return next(new appError_1.appError("Access denied", 403));
        }
        // Get staff details with hotel
        const staff = yield staff_model_1.Staff.findById(req.user._id);
        if (!staff) {
            return next(new appError_1.appError("Staff not found", 404));
        }
        // Verify all items belong to the staff's hotel
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: staff.hotelId,
            isDeleted: false
        });
        if (!hotel) {
            return next(new appError_1.appError("Hotel not found", 404));
        }
        // If tableNumber is provided, book it
        if (tableNumber) {
            const table = yield qrcode_model_1.QRCode.findOneAndUpdate({ hotelId: staff.hotelId, tableNumber: tableNumber, isDeleted: false, status: 'available' }, { status: 'booked' }, { new: true });
            if (!table) {
                return next(new appError_1.appError('This table is not available or does not exist.', 404));
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
        const order = new order_model_1.Order({
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
        yield order.save();
        // Manually populate menu items from hotel
        const populatedItems = yield Promise.all(order.items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
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
            const itemObject = item.toObject();
            return Object.assign(Object.assign({}, itemObject), { menuItemData });
        })));
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Order created successfully",
            data: Object.assign(Object.assign({}, order.toObject()), { items: populatedItems })
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createStaffOrder = createStaffOrder;
// Get all orders for staff's hotel
const getStaffHotelOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user is staff
        if (req.user.role !== 'staff') {
            next(new appError_1.appError("Access denied", 403));
            return;
        }
        // Get staff details with hotel
        const staff = yield staff_model_1.Staff.findById(req.user._id);
        if (!staff) {
            next(new appError_1.appError("Staff not found", 404));
            return;
        }
        // Get orders for the hotel
        const orders = yield order_model_1.Order.find({
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
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: staff.hotelId,
            isDeleted: false
        });
        // console.log("hotel check", hotel)
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        // Manually populate menu items from hotel
        const populatedOrders = yield Promise.all(orders.map((order) => __awaiter(void 0, void 0, void 0, function* () {
            const populatedItems = yield Promise.all(order.items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                let menuItemData = null;
                for (const category of hotel.menuCategories) {
                    // Try to match by both ID and title (case-insensitive)
                    const menuItem = category.items.find(mi => {
                        var _a, _b, _c;
                        return mi.id === item.menuItem ||
                            ((_a = mi.title) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === ((_b = item.menuItem) === null || _b === void 0 ? void 0 : _b.toLowerCase()) ||
                            ((_c = mi._id) === null || _c === void 0 ? void 0 : _c.toString()) === item.menuItem;
                    });
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
                const itemObject = item.toObject();
                return Object.assign(Object.assign({}, itemObject), { menuItemData });
            })));
            return Object.assign(Object.assign({}, order.toObject()), { items: populatedItems });
        })));
        // console.log('populated item data', populatedOrders)
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Orders retrieved successfully",
            data: populatedOrders
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getStaffHotelOrders = getStaffHotelOrders;
// Update order status (staff only)
const updateStaffOrderStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = order_validation_1.updateOrderStatusValidation.parse(req.body);
        // Check if user is staff
        if (req.user.role !== 'staff') {
            return next(new appError_1.appError("Access denied", 403));
        }
        // Get staff details with hotel
        const staff = yield staff_model_1.Staff.findById(req.user._id);
        if (!staff) {
            return next(new appError_1.appError("Staff not found", 404));
        }
        // Find order and check if it belongs to staff's hotel
        const order = yield order_model_1.Order.findOne({
            _id: req.params.id,
            "items.hotelId": staff.hotelId
        });
        if (!order) {
            return next(new appError_1.appError("Order not found or you don't have permission to update it", 404));
        }
        // if order has table number and status is delivered or cancelled, make table available
        if (order.tableNumber && (status === 'delivered' || status === 'cancelled')) {
            yield qrcode_model_1.QRCode.findOneAndUpdate({ hotelId: staff.hotelId, tableNumber: order.tableNumber, isDeleted: false }, { status: 'available' });
        }
        // Update order status
        order.status = status;
        yield order.save();
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Order status updated successfully",
            data: order
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateStaffOrderStatus = updateStaffOrderStatus;
// Get order details (staff only)
const getStaffOrderDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user is staff
        if (req.user.role !== 'staff') {
            return next(new appError_1.appError("Access denied", 403));
        }
        // Get staff details with hotel
        const staff = yield staff_model_1.Staff.findById(req.user._id);
        if (!staff) {
            return next(new appError_1.appError("Staff not found", 404));
        }
        // Find order and check if it belongs to staff's hotel
        const order = yield order_model_1.Order.findOne({
            _id: req.params.id,
            "items.hotelId": staff.hotelId
        }).populate('user', 'name phone email');
        if (!order) {
            return next(new appError_1.appError("Order not found or you don't have permission to view it", 404));
        }
        // Get hotel for menu item details
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: staff.hotelId,
            isDeleted: false
        });
        if (!hotel) {
            return next(new appError_1.appError("Hotel not found", 404));
        }
        // Manually populate menu items from hotel
        const populatedItems = yield Promise.all(order.items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
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
            const itemObject = item.toObject();
            return Object.assign(Object.assign({}, itemObject), { menuItemData });
        })));
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Order retrieved successfully",
            data: Object.assign(Object.assign({}, order.toObject()), { items: populatedItems })
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getStaffOrderDetails = getStaffOrderDetails;
const updateStaffOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderId = req.params.id;
        const validatedData = staff_order_validation_1.staffOrderUpdateValidation.parse(req.body);
        if (req.user.role !== 'staff') {
            return next(new appError_1.appError("Access denied", 403));
        }
        const staff = yield staff_model_1.Staff.findById(req.user._id);
        if (!staff) {
            return next(new appError_1.appError("Staff not found", 404));
        }
        const order = yield order_model_1.Order.findOne({
            _id: orderId,
            "items.hotelId": staff.hotelId
        });
        if (!order) {
            return next(new appError_1.appError("Order not found or you don't have permission to update it", 404));
        }
        // Case 1: Order is assigned a new table or table is changed
        if (validatedData.tableNumber && validatedData.tableNumber !== order.tableNumber) {
            // Release the old table
            if (order.tableNumber) {
                yield qrcode_model_1.QRCode.findOneAndUpdate({ hotelId: staff.hotelId, tableNumber: order.tableNumber, isDeleted: false }, { status: 'available' });
            }
            // Book the new table
            const newTable = yield qrcode_model_1.QRCode.findOneAndUpdate({ hotelId: staff.hotelId, tableNumber: validatedData.tableNumber, isDeleted: false, status: 'available' }, { status: 'booked' }, { new: true });
            if (!newTable) {
                return next(new appError_1.appError('The new table is not available or does not exist.', 400));
            }
        }
        // Case 2: Order status changes to delivered or cancelled
        if (validatedData.status && (validatedData.status === 'delivered' || validatedData.status === 'cancelled') && (validatedData.tableNumber || order.tableNumber)) {
            yield qrcode_model_1.QRCode.findOneAndUpdate({ hotelId: staff.hotelId, tableNumber: validatedData.tableNumber || order.tableNumber, isDeleted: false }, { status: 'available' });
        }
        // If items are being updated, manually add the hotelId to each item
        if (validatedData.items) {
            const itemsWithHotelId = validatedData.items.map(item => (Object.assign(Object.assign({}, item), { hotelId: staff.hotelId })));
            // Update items separately
            order.items = itemsWithHotelId;
            delete validatedData.items;
        }
        // Update other order fields
        order.set(validatedData);
        const updatedOrder = yield order.save();
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Order updated successfully",
            data: updatedOrder
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateStaffOrder = updateStaffOrder;
