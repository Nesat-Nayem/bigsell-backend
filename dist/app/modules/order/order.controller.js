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
exports.getOrderSummary = exports.updatePaymentStatus = exports.returnOrder = exports.cancelOrder = exports.updateOrderStatus = exports.getOrderById = exports.getAllOrders = exports.getUserOrders = exports.createOrder = void 0;
const order_model_1 = require("./order.model");
const product_model_1 = require("../product/product.model");
const cart_model_1 = require("../cart/cart.model");
const mongoose_1 = __importDefault(require("mongoose"));
const appError_1 = require("../../errors/appError");
// Create new order
const createOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { items, shippingAddress, billingAddress, paymentMethod, shippingMethod, notes, couponCode } = req.body;
        if (!userId) {
            next(new appError_1.appError('User not authenticated', 401));
            return;
        }
        // Validate and process order items
        const orderItems = [];
        let subtotal = 0;
        for (const item of items) {
            if (!mongoose_1.default.Types.ObjectId.isValid(item.productId)) {
                next(new appError_1.appError(`Invalid product ID: ${item.productId}`, 400));
                return;
            }
            const product = yield product_model_1.Product.findOne({
                _id: item.productId,
                isDeleted: false,
                status: 'active'
            });
            if (!product) {
                next(new appError_1.appError(`Product not found: ${item.productId}`, 404));
                return;
            }
            if (product.stock < item.quantity) {
                next(new appError_1.appError(`Insufficient stock for ${product.name}. Available: ${product.stock}`, 400));
                return;
            }
            // Check color/size availability
            if (item.selectedColor && product.colors && !product.colors.includes(item.selectedColor)) {
                next(new appError_1.appError(`Color ${item.selectedColor} not available for ${product.name}`, 400));
                return;
            }
            if (item.selectedSize && product.sizes && !product.sizes.includes(item.selectedSize)) {
                next(new appError_1.appError(`Size ${item.selectedSize} not available for ${product.name}`, 400));
                return;
            }
            const itemSubtotal = product.price * item.quantity;
            subtotal += itemSubtotal;
            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                selectedColor: item.selectedColor,
                selectedSize: item.selectedSize,
                thumbnail: product.thumbnail,
                subtotal: itemSubtotal,
            });
            // Update product stock
            product.stock -= item.quantity;
            yield product.save();
        }
        // Calculate totals
        const shippingCost = shippingMethod === 'express' ? 100 : 50; // Example shipping costs
        const tax = subtotal * 0.05; // 5% tax
        let discount = 0;
        // Apply coupon if provided (simplified logic)
        if (couponCode === 'SAVE10') {
            discount = subtotal * 0.1; // 10% discount
        }
        const totalAmount = subtotal + shippingCost + tax - discount;
        // Create order
        const order = new order_model_1.Order({
            user: userId,
            items: orderItems,
            subtotal,
            shippingCost,
            tax,
            discount,
            totalAmount,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            paymentInfo: {
                method: paymentMethod,
                status: paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending',
                amount: totalAmount,
            },
            shippingMethod,
            notes,
            statusHistory: [{
                    status: 'pending',
                    timestamp: new Date(),
                    note: 'Order created',
                }],
        });
        yield order.save();
        // Clear user's cart after successful order
        try {
            const userCart = yield cart_model_1.Cart.findOne({ user: userId, isDeleted: false });
            if (userCart) {
                yield userCart.clearCart();
            }
        }
        catch (error) {
            // Cart clearing failure shouldn't fail the order
            console.log('Failed to clear cart:', error);
        }
        // Populate order details
        const populatedOrder = yield order_model_1.Order.findById(order._id)
            .populate('user', 'name email phone')
            .populate('items.product', 'name price images thumbnail');
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: 'Order created successfully',
            data: populatedOrder,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.createOrder = createOrder;
// Get user's orders
const getUserOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { page = 1, limit = 10, status, paymentStatus, dateFrom, dateTo, sort = '-orderDate' } = req.query;
        if (!userId) {
            next(new appError_1.appError('User not authenticated', 401));
            return;
        }
        const filter = { user: userId, isDeleted: false };
        if (status)
            filter.status = status;
        if (paymentStatus)
            filter.paymentStatus = paymentStatus;
        if (dateFrom || dateTo) {
            filter.orderDate = {};
            if (dateFrom)
                filter.orderDate.$gte = new Date(dateFrom);
            if (dateTo)
                filter.orderDate.$lte = new Date(dateTo);
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [orders, total] = yield Promise.all([
            order_model_1.Order.find(filter)
                .populate('user', 'name email phone')
                .populate('items.product', 'name price images thumbnail')
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            order_model_1.Order.countDocuments(filter),
        ]);
        const totalPages = Math.ceil(total / Number(limit));
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Orders retrieved successfully',
            meta: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages,
            },
            data: orders,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getUserOrders = getUserOrders;
// Get all orders (admin only)
const getAllOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, status, paymentStatus, dateFrom, dateTo, sort = '-orderDate' } = req.query;
        const filter = { isDeleted: false };
        if (status)
            filter.status = status;
        if (paymentStatus)
            filter.paymentStatus = paymentStatus;
        if (dateFrom || dateTo) {
            filter.orderDate = {};
            if (dateFrom)
                filter.orderDate.$gte = new Date(dateFrom);
            if (dateTo)
                filter.orderDate.$lte = new Date(dateTo);
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [orders, total] = yield Promise.all([
            order_model_1.Order.find(filter)
                .populate('user', 'name email phone')
                .populate('items.product', 'name price images thumbnail')
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            order_model_1.Order.countDocuments(filter),
        ]);
        const totalPages = Math.ceil(total / Number(limit));
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Orders retrieved successfully',
            meta: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages,
            },
            data: orders,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getAllOrders = getAllOrders;
// Get single order by ID
const getOrderById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            next(new appError_1.appError('Invalid order ID', 400));
            return;
        }
        const filter = { _id: id, isDeleted: false };
        // Non-admin users can only view their own orders
        if (userRole !== 'admin') {
            filter.user = userId;
        }
        const order = yield order_model_1.Order.findOne(filter)
            .populate('user', 'name email phone')
            .populate('items.product', 'name price images thumbnail')
            .lean();
        if (!order) {
            next(new appError_1.appError('Order not found', 404));
            return;
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Order retrieved successfully',
            data: order,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getOrderById = getOrderById;
// Update order status (admin only)
const updateOrderStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { status, note, trackingNumber, estimatedDelivery } = req.body;
        const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            next(new appError_1.appError('Invalid order ID', 400));
            return;
        }
        const order = yield order_model_1.Order.findOne({ _id: id, isDeleted: false });
        if (!order) {
            next(new appError_1.appError('Order not found', 404));
            return;
        }
        // Update order status using instance method
        yield order.updateStatus(status, note, adminId);
        // Update additional fields if provided
        if (trackingNumber)
            order.trackingNumber = trackingNumber;
        if (estimatedDelivery)
            order.estimatedDelivery = new Date(estimatedDelivery);
        yield order.save();
        // Get updated order with populated data
        const updatedOrder = yield order_model_1.Order.findById(id)
            .populate('user', 'name email phone')
            .populate('items.product', 'name price images thumbnail');
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Order status updated successfully',
            data: updatedOrder,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.updateOrderStatus = updateOrderStatus;
// Cancel order
const cancelOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            next(new appError_1.appError('Invalid order ID', 400));
            return;
        }
        const filter = { _id: id, isDeleted: false };
        // Non-admin users can only cancel their own orders
        if (userRole !== 'admin') {
            filter.user = userId;
        }
        const order = yield order_model_1.Order.findOne(filter);
        if (!order) {
            next(new appError_1.appError('Order not found', 404));
            return;
        }
        // Check if order can be cancelled
        if (['delivered', 'cancelled', 'returned'].includes(order.status)) {
            next(new appError_1.appError(`Cannot cancel order with status: ${order.status}`, 400));
            return;
        }
        // Cancel order using instance method
        yield order.cancelOrder(reason, userId);
        // Restore product stock
        for (const item of order.items) {
            yield product_model_1.Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }
        // Get updated order with populated data
        const updatedOrder = yield order_model_1.Order.findById(id)
            .populate('user', 'name email phone')
            .populate('items.product', 'name price images thumbnail');
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Order cancelled successfully',
            data: updatedOrder,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.cancelOrder = cancelOrder;
// Return order
const returnOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            next(new appError_1.appError('Invalid order ID', 400));
            return;
        }
        const filter = { _id: id, isDeleted: false };
        // Non-admin users can only return their own orders
        if (userRole !== 'admin') {
            filter.user = userId;
        }
        const order = yield order_model_1.Order.findOne(filter);
        if (!order) {
            next(new appError_1.appError('Order not found', 404));
            return;
        }
        // Check if order can be returned
        if (order.status !== 'delivered') {
            next(new appError_1.appError('Only delivered orders can be returned', 400));
            return;
        }
        // Update order status to returned
        order.status = 'returned';
        order.returnReason = reason;
        order.statusHistory.push({
            status: 'returned',
            timestamp: new Date(),
            note: `Order returned: ${reason}`,
            updatedBy: userId,
        });
        yield order.save();
        // Get updated order with populated data
        const updatedOrder = yield order_model_1.Order.findById(id)
            .populate('user', 'name email phone')
            .populate('items.product', 'name price images thumbnail');
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Order returned successfully',
            data: updatedOrder,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.returnOrder = returnOrder;
// Update payment status (admin only)
const updatePaymentStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { paymentStatus, transactionId, paymentDate } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            next(new appError_1.appError('Invalid order ID', 400));
            return;
        }
        const order = yield order_model_1.Order.findOne({ _id: id, isDeleted: false });
        if (!order) {
            next(new appError_1.appError('Order not found', 404));
            return;
        }
        // Update payment info
        order.paymentStatus = paymentStatus;
        order.paymentInfo.status = paymentStatus;
        if (transactionId)
            order.paymentInfo.transactionId = transactionId;
        if (paymentDate)
            order.paymentInfo.paymentDate = new Date(paymentDate);
        if (paymentStatus === 'paid')
            order.paymentInfo.paymentDate = new Date();
        yield order.save();
        // Get updated order with populated data
        const updatedOrder = yield order_model_1.Order.findById(id)
            .populate('user', 'name email phone')
            .populate('items.product', 'name price images thumbnail');
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Payment status updated successfully',
            data: updatedOrder,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.updatePaymentStatus = updatePaymentStatus;
// Get order summary/statistics (admin only)
const getOrderSummary = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const [totalOrders, pendingOrders, completedOrders, totalRevenue] = yield Promise.all([
            order_model_1.Order.countDocuments({ isDeleted: false }),
            order_model_1.Order.countDocuments({ status: 'pending', isDeleted: false }),
            order_model_1.Order.countDocuments({ status: 'delivered', isDeleted: false }),
            order_model_1.Order.aggregate([
                { $match: { status: 'delivered', isDeleted: false } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
        ]);
        const summary = {
            totalOrders,
            pendingOrders,
            completedOrders,
            totalRevenue: ((_a = totalRevenue[0]) === null || _a === void 0 ? void 0 : _a.total) || 0,
        };
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Order summary retrieved successfully',
            data: summary,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getOrderSummary = getOrderSummary;
