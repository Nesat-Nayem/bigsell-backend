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
exports.getPaymentSummary = exports.handleWebhook = exports.refundPayment = exports.getPaymentById = exports.getAllPayments = exports.getUserPayments = exports.verifyPayment = exports.handleCashfreeReturn = exports.initiateCashfreePayment = exports.handleCashfreeWebhook = exports.createPayment = void 0;
const payment_model_1 = require("./payment.model");
const order_model_1 = require("../order/order.model");
const cart_model_1 = require("../cart/cart.model");
const mongoose_1 = __importDefault(require("mongoose"));
const appError_1 = require("../../errors/appError");
const crypto_1 = __importDefault(require("crypto"));
const cashfree_1 = require("./gateways/cashfree");
// Razorpay configuration (you'll need to install razorpay package)
// npm install razorpay @types/razorpay
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'your_razorpay_key_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret',
});
// Create payment order (Razorpay order creation)
const createPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { orderId, amount, currency = 'INR', method, description, notes, customerEmail, customerPhone } = req.body;
        if (!userId) {
            next(new appError_1.appError('User not authenticated', 401));
            return;
        }
        // Validate order exists and belongs to user
        if (!mongoose_1.default.Types.ObjectId.isValid(orderId)) {
            next(new appError_1.appError('Invalid order ID', 400));
            return;
        }
        const order = yield order_model_1.Order.findOne({
            _id: orderId,
            user: userId,
            isDeleted: false
        });
        if (!order) {
            next(new appError_1.appError('Order not found', 404));
            return;
        }
        // Check if payment already exists for this order
        const existingPayment = yield payment_model_1.Payment.findOne({
            orderId,
            status: { $in: ['pending', 'processing', 'completed'] },
            isDeleted: false
        });
        if (existingPayment) {
            next(new appError_1.appError('Payment already exists for this order', 400));
            return;
        }
        // Get user details from request or order
        const email = customerEmail || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.email) || order.shippingAddress.email;
        const phone = customerPhone || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.phone) || order.shippingAddress.phone;
        let razorpayOrder = null;
        let razorpayOrderId = null;
        // Create Razorpay order for online payments
        if (method !== 'cash_on_delivery') {
            try {
                const razorpayOptions = {
                    amount: amount * 100, // Razorpay expects amount in paisa
                    currency: currency.toUpperCase(),
                    receipt: `order_${orderId}_${Date.now()}`,
                    notes: Object.assign({ orderId: orderId, userId: userId.toString() }, notes),
                };
                razorpayOrder = yield razorpay.orders.create(razorpayOptions);
                razorpayOrderId = razorpayOrder.id;
            }
            catch (error) {
                console.error('Razorpay order creation failed:', error);
                next(new appError_1.appError('Failed to create payment order', 500));
                return;
            }
        }
        // Create payment record
        const payment = new payment_model_1.Payment({
            orderId,
            userId,
            amount: amount * 100, // Store in paisa
            currency: currency.toUpperCase(),
            method,
            status: method === 'cash_on_delivery' ? 'pending' : 'pending',
            razorpayOrderId,
            description: description || `Payment for order ${order.orderNumber}`,
            notes: notes || {},
            customerEmail: email,
            customerPhone: phone,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
        });
        yield payment.save();
        // Update order payment status if COD
        if (method === 'cash_on_delivery') {
            order.paymentStatus = 'pending';
            order.paymentInfo.method = 'cash_on_delivery';
            order.paymentInfo.status = 'pending';
            yield order.save();
        }
        const response = {
            paymentId: payment.paymentId,
            orderId: payment.orderId,
            amount: payment.amount,
            currency: payment.currency,
            method: payment.method,
            status: payment.status,
        };
        // Add Razorpay details for online payments
        if (razorpayOrder) {
            response.razorpayOrderId = razorpayOrder.id;
            response.razorpayKeyId = process.env.RAZORPAY_KEY_ID;
            response.razorpayOrder = razorpayOrder;
        }
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: 'Payment initiated successfully',
            data: response,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.createPayment = createPayment;
// Cashfree webhook handler (server-to-server notifications)
const handleCashfreeWebhook = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    try {
        const providedSig = req.get('x-webhook-signature') || req.get('X-Webhook-Signature');
        const secret = process.env.CASHFREE_WEBHOOK_SECRET || '';
        if (!providedSig || !secret) {
            return res.status(400).json({ success: false, message: 'Missing signature or secret' });
        }
        // Cashfree expects HMAC-SHA256 over RAW request body, base64 encoded
        const rawBody = req.rawBody
            ? String(req.rawBody)
            : JSON.stringify(req.body || {});
        const expected = crypto_1.default.createHmac('sha256', secret).update(rawBody).digest('base64');
        const safeEqual = (a, b) => {
            const ab = Buffer.from(String(a));
            const bb = Buffer.from(String(b));
            if (ab.length !== bb.length)
                return false;
            return crypto_1.default.timingSafeEqual(ab, bb);
        };
        if (!safeEqual(providedSig, expected)) {
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }
        const payload = req.body || {};
        const type = String((payload === null || payload === void 0 ? void 0 : payload.type) || (payload === null || payload === void 0 ? void 0 : payload.event) || (payload === null || payload === void 0 ? void 0 : payload.event_type) || '').toLowerCase();
        const cfOrderId = ((_b = (_a = payload === null || payload === void 0 ? void 0 : payload.data) === null || _a === void 0 ? void 0 : _a.order) === null || _b === void 0 ? void 0 : _b.order_id) || ((_c = payload === null || payload === void 0 ? void 0 : payload.order) === null || _c === void 0 ? void 0 : _c.order_id) || (payload === null || payload === void 0 ? void 0 : payload.order_id) || ((_d = payload === null || payload === void 0 ? void 0 : payload.data) === null || _d === void 0 ? void 0 : _d.order_id);
        const cfPaymentId = ((_f = (_e = payload === null || payload === void 0 ? void 0 : payload.data) === null || _e === void 0 ? void 0 : _e.payment) === null || _f === void 0 ? void 0 : _f.payment_id) || ((_g = payload === null || payload === void 0 ? void 0 : payload.payment) === null || _g === void 0 ? void 0 : _g.payment_id) || ((_j = (_h = payload === null || payload === void 0 ? void 0 : payload.data) === null || _h === void 0 ? void 0 : _h.payment) === null || _j === void 0 ? void 0 : _j.id);
        const statusRaw = ((_l = (_k = payload === null || payload === void 0 ? void 0 : payload.data) === null || _k === void 0 ? void 0 : _k.payment) === null || _l === void 0 ? void 0 : _l.payment_status) || ((_m = payload === null || payload === void 0 ? void 0 : payload.payment) === null || _m === void 0 ? void 0 : _m.payment_status) || (payload === null || payload === void 0 ? void 0 : payload.status) || '';
        const status = String(statusRaw).toUpperCase();
        const isPaid = type.includes('order.paid') || ['PAID', 'SUCCESS', 'COMPLETED'].includes(status);
        if (!cfOrderId) {
            return res.status(200).json({ success: true, message: 'No order_id in webhook; ignored' });
        }
        const payment = yield payment_model_1.Payment.findOne({
            gateway: 'cashfree',
            gatewayOrderId: cfOrderId,
            isDeleted: false,
        }).sort('-createdAt');
        if (!payment) {
            // Acknowledge to avoid retries; optionally log
            return res.status(200).json({ success: true, message: 'Payment not found for cf order id' });
        }
        if (isPaid) {
            yield payment.markCompleted(payload);
        }
        else if (status) {
            yield payment.markFailed(`Status: ${status}`, 'CF_WEBHOOK', type || status);
        }
        // Update linked order status
        const order = yield order_model_1.Order.findById(payment.orderId);
        if (order) {
            const paid = !!isPaid;
            order.paymentStatus = paid ? 'paid' : 'failed';
            order.paymentInfo.status = paid ? 'completed' : 'failed';
            order.paymentInfo.transactionId = cfPaymentId || payment.gatewayPaymentId || payment.gatewayOrderId;
            if (paid)
                order.paymentInfo.paymentDate = new Date();
            yield order.save();
            // Clear user's cart on successful payment (safety net)
            if (paid && order.user) {
                try {
                    const userCart = yield cart_model_1.Cart.findOne({ user: order.user, isDeleted: false });
                    if (userCart) {
                        yield userCart.clearCart();
                    }
                }
                catch (error) {
                    // Cart clearing failure shouldn't fail the webhook
                    console.log('Failed to clear cart in webhook:', error);
                }
            }
        }
        return res.status(200).json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
exports.handleCashfreeWebhook = handleCashfreeWebhook;
// Cashfree: initiate payment for an existing order
const initiateCashfreePayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { orderId } = req.body;
        if (!userId) {
            next(new appError_1.appError('User not authenticated', 401));
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(orderId)) {
            next(new appError_1.appError('Invalid order ID', 400));
            return;
        }
        const order = yield order_model_1.Order.findOne({ _id: orderId, user: userId, isDeleted: false });
        if (!order) {
            next(new appError_1.appError('Order not found', 404));
            return;
        }
        // Prevent duplicate active payments
        const existingPayment = yield payment_model_1.Payment.findOne({
            orderId,
            gateway: 'cashfree',
            status: { $in: ['pending', 'processing', 'completed'] },
            isDeleted: false,
        });
        if (existingPayment) {
            next(new appError_1.appError('Payment already exists for this order', 400));
            return;
        }
        const returnUrl = (0, cashfree_1.getReturnUrl)(req, orderId);
        const cfOrder = yield (0, cashfree_1.createCashfreeOrder)({
            orderAmount: order.totalAmount,
            currency: 'INR',
            customer: {
                id: String(userId),
                name: ((_b = order === null || order === void 0 ? void 0 : order.user) === null || _b === void 0 ? void 0 : _b.name) || '',
                email: ((_c = order === null || order === void 0 ? void 0 : order.shippingAddress) === null || _c === void 0 ? void 0 : _c.email) || '',
                phone: ((_d = order === null || order === void 0 ? void 0 : order.shippingAddress) === null || _d === void 0 ? void 0 : _d.phone) || '',
            },
            returnUrl,
            notes: { orderNumber: order.orderNumber, ourOrderId: orderId },
        });
        // Create payment record
        const payment = new payment_model_1.Payment({
            orderId,
            userId,
            amount: Math.round(order.totalAmount * 100),
            currency: 'INR',
            method: 'card',
            gateway: 'cashfree',
            status: 'pending',
            gatewayOrderId: cfOrder === null || cfOrder === void 0 ? void 0 : cfOrder.order_id,
            description: `Cashfree payment for order ${order.orderNumber}`,
            notes: { cf: { order_id: cfOrder === null || cfOrder === void 0 ? void 0 : cfOrder.order_id } },
            customerEmail: ((_e = order === null || order === void 0 ? void 0 : order.shippingAddress) === null || _e === void 0 ? void 0 : _e.email) || '',
            customerPhone: ((_f = order === null || order === void 0 ? void 0 : order.shippingAddress) === null || _f === void 0 ? void 0 : _f.phone) || '',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
        });
        yield payment.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: 'Cashfree payment initiated successfully',
            data: {
                paymentId: payment.paymentId,
                orderId: payment.orderId,
                gateway: 'cashfree',
                status: payment.status,
                cashfreeOrderId: cfOrder === null || cfOrder === void 0 ? void 0 : cfOrder.order_id,
                paymentSessionId: cfOrder === null || cfOrder === void 0 ? void 0 : cfOrder.payment_session_id,
            },
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.initiateCashfreePayment = initiateCashfreePayment;
// Cashfree: return URL handler (redirect flow)
const handleCashfreeReturn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ourOrderId = String(req.query.our_order_id || '');
        if (!ourOrderId || !mongoose_1.default.Types.ObjectId.isValid(ourOrderId)) {
            return res.redirect((process.env.WEB_BASE_URL || 'http://localhost:3000') + '/account?tab=orders&payment=invalid');
        }
        // Find the latest cashfree payment for this order
        const payment = yield payment_model_1.Payment.findOne({ orderId: ourOrderId, gateway: 'cashfree', isDeleted: false }).sort('-createdAt');
        if (!payment || !payment.gatewayOrderId) {
            return res.redirect((process.env.WEB_BASE_URL || 'http://localhost:3000') + `/orders/${ourOrderId}?payment=missing`);
        }
        // Fetch order status from Cashfree
        let cfOrder;
        try {
            cfOrder = yield (0, cashfree_1.fetchCashfreeOrder)((payment.gatewayOrderId));
        }
        catch (e) {
            yield payment.markFailed('Cashfree fetch order failed', 'CF_FETCH_FAILED');
            return res.redirect((process.env.WEB_BASE_URL || 'http://localhost:3000') + `/orders/${ourOrderId}?payment=failed`);
        }
        const status = String((cfOrder === null || cfOrder === void 0 ? void 0 : cfOrder.order_status) || (cfOrder === null || cfOrder === void 0 ? void 0 : cfOrder.status) || '').toUpperCase();
        const isPaid = status === 'PAID' || status === 'COMPLETED' || status === 'SUCCESS';
        // Update payment record
        if (isPaid) {
            yield payment.markCompleted(cfOrder);
        }
        else {
            yield payment.markFailed(`Status: ${status || 'UNKNOWN'}`, 'CF_STATUS');
        }
        // Update order payment status
        const order = yield order_model_1.Order.findById(ourOrderId);
        if (order) {
            order.paymentStatus = isPaid ? 'paid' : 'failed';
            order.paymentInfo.status = isPaid ? 'completed' : 'failed';
            order.paymentInfo.transactionId = payment.gatewayPaymentId || payment.gatewayOrderId || payment.paymentId;
            order.paymentInfo.paymentDate = isPaid ? new Date() : order.paymentInfo.paymentDate;
            yield order.save();
        }
        const webBase = process.env.WEB_BASE_URL || 'http://localhost:3000';
        if (isPaid) {
            return res.redirect(`${webBase}/orders/${ourOrderId}?payment=success`);
        }
        else {
            return res.redirect(`${webBase}/orders/${ourOrderId}?payment=failed`);
        }
    }
    catch (error) {
        next(error);
    }
});
exports.handleCashfreeReturn = handleCashfreeReturn;
// Verify Razorpay payment
const verifyPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        // Find payment by Razorpay order ID
        const payment = yield payment_model_1.Payment.findOne({
            razorpayOrderId: razorpay_order_id,
            isDeleted: false
        }).populate('orderId');
        if (!payment) {
            next(new appError_1.appError('Payment not found', 404));
            return;
        }
        // Verify signature
        const expectedSignature = crypto_1.default
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');
        if (expectedSignature !== razorpay_signature) {
            // Mark payment as failed
            yield payment.markFailed('Invalid signature', 'SIGNATURE_MISMATCH', 'Payment signature verification failed');
            next(new appError_1.appError('Payment verification failed', 400));
            return;
        }
        // Fetch payment details from Razorpay
        try {
            const razorpayPayment = yield razorpay.payments.fetch(razorpay_payment_id);
            // Update payment record
            payment.razorpayPaymentId = razorpay_payment_id;
            payment.razorpaySignature = razorpay_signature;
            payment.status = razorpayPayment.status === 'captured' ? 'completed' : 'processing';
            payment.gatewayResponse = razorpayPayment;
            if (payment.status === 'completed') {
                payment.completedAt = new Date();
            }
            yield payment.save();
            // Update order payment status
            const order = payment.orderId;
            if (order) {
                order.paymentStatus = payment.status === 'completed' ? 'paid' : 'pending';
                order.paymentInfo.status = payment.status === 'completed' ? 'completed' : 'pending';
                order.paymentInfo.transactionId = razorpay_payment_id;
                order.paymentInfo.paymentDate = payment.completedAt;
                yield order.save();
            }
            res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Payment verified successfully',
                data: {
                    paymentId: payment.paymentId,
                    status: payment.status,
                    razorpayPaymentId: razorpay_payment_id,
                    amount: payment.amount,
                },
            });
            return;
        }
        catch (error) {
            console.error('Razorpay payment fetch failed:', error);
            yield payment.markFailed('Payment fetch failed', 'FETCH_ERROR', error.message);
            next(new appError_1.appError('Payment verification failed', 500));
            return;
        }
    }
    catch (error) {
        next(error);
    }
});
exports.verifyPayment = verifyPayment;
// Get user payments
const getUserPayments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { page = 1, limit = 10, status, method, orderId, dateFrom, dateTo, sort = '-initiatedAt' } = req.query;
        if (!userId) {
            next(new appError_1.appError('User not authenticated', 401));
            return;
        }
        const filter = { userId, isDeleted: false };
        if (status)
            filter.status = status;
        if (method)
            filter.method = method;
        if (orderId)
            filter.orderId = orderId;
        if (dateFrom || dateTo) {
            filter.initiatedAt = {};
            if (dateFrom)
                filter.initiatedAt.$gte = new Date(dateFrom);
            if (dateTo)
                filter.initiatedAt.$lte = new Date(dateTo);
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [payments, total] = yield Promise.all([
            payment_model_1.Payment.find(filter)
                .populate('orderId', 'orderNumber totalAmount status')
                .populate('userId', 'name email phone')
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            payment_model_1.Payment.countDocuments(filter),
        ]);
        const totalPages = Math.ceil(total / Number(limit));
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Payments retrieved successfully',
            meta: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages,
            },
            data: payments,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getUserPayments = getUserPayments;
// Get all payments (admin only)
const getAllPayments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, status, method, orderId, dateFrom, dateTo, sort = '-initiatedAt' } = req.query;
        const filter = { isDeleted: false };
        if (status)
            filter.status = status;
        if (method)
            filter.method = method;
        if (orderId)
            filter.orderId = orderId;
        if (dateFrom || dateTo) {
            filter.initiatedAt = {};
            if (dateFrom)
                filter.initiatedAt.$gte = new Date(dateFrom);
            if (dateTo)
                filter.initiatedAt.$lte = new Date(dateTo);
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [payments, total] = yield Promise.all([
            payment_model_1.Payment.find(filter)
                .populate('orderId', 'orderNumber totalAmount status')
                .populate('userId', 'name email phone')
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            payment_model_1.Payment.countDocuments(filter),
        ]);
        const totalPages = Math.ceil(total / Number(limit));
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Payments retrieved successfully',
            meta: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages,
            },
            data: payments,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getAllPayments = getAllPayments;
// Get single payment by ID
const getPaymentById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            next(new appError_1.appError('Invalid payment ID', 400));
            return;
        }
        const filter = { _id: id, isDeleted: false };
        // Non-admin users can only view their own payments
        if (userRole !== 'admin') {
            filter.userId = userId;
        }
        const payment = yield payment_model_1.Payment.findOne(filter)
            .populate('orderId', 'orderNumber totalAmount status')
            .populate('userId', 'name email phone')
            .lean();
        if (!payment) {
            next(new appError_1.appError('Payment not found', 404));
            return;
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Payment retrieved successfully',
            data: payment,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getPaymentById = getPaymentById;
// Refund payment (admin only)
const refundPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { amount, reason, notes } = req.body;
        const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            next(new appError_1.appError('Invalid payment ID', 400));
            return;
        }
        const payment = yield payment_model_1.Payment.findOne({ _id: id, isDeleted: false });
        if (!payment) {
            next(new appError_1.appError('Payment not found', 404));
            return;
        }
        if (payment.status !== 'completed') {
            next(new appError_1.appError('Only completed payments can be refunded', 400));
            return;
        }
        const refundAmount = amount || (payment.amount - payment.amountRefunded);
        if (refundAmount <= 0 || refundAmount > (payment.amount - payment.amountRefunded)) {
            next(new appError_1.appError('Invalid refund amount', 400));
            return;
        }
        try {
            // Create refund in Razorpay
            let razorpayRefund = null;
            if (payment.razorpayPaymentId) {
                razorpayRefund = yield razorpay.payments.refund(payment.razorpayPaymentId, {
                    amount: refundAmount,
                    notes: notes || {},
                });
            }
            // Add refund to payment record
            yield payment.addRefund({
                refundId: (razorpayRefund === null || razorpayRefund === void 0 ? void 0 : razorpayRefund.id) || `REF-${Date.now()}`,
                amount: refundAmount,
                reason,
                status: razorpayRefund ? 'processed' : 'pending',
                processedAt: razorpayRefund ? new Date() : undefined,
                refundedBy: adminId,
            });
            // Get updated payment
            const updatedPayment = yield payment_model_1.Payment.findById(id)
                .populate('orderId', 'orderNumber totalAmount status')
                .populate('userId', 'name email phone');
            res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Refund processed successfully',
                data: updatedPayment,
            });
            return;
        }
        catch (error) {
            console.error('Refund processing failed:', error);
            next(new appError_1.appError('Refund processing failed', 500));
            return;
        }
    }
    catch (error) {
        next(error);
    }
});
exports.refundPayment = refundPayment;
// Webhook handler for Razorpay
const handleWebhook = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const webhookSignature = req.get('X-Razorpay-Signature');
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!webhookSignature || !webhookSecret) {
            next(new appError_1.appError('Invalid webhook request', 400));
            return;
        }
        // Verify webhook signature
        const expectedSignature = crypto_1.default
            .createHmac('sha256', webhookSecret)
            .update(JSON.stringify(req.body))
            .digest('hex');
        if (expectedSignature !== webhookSignature) {
            next(new appError_1.appError('Invalid webhook signature', 400));
            return;
        }
        const { event, payload } = req.body;
        // Handle different webhook events
        switch (event) {
            case 'payment.captured':
                yield handlePaymentCaptured(payload.payment.entity);
                break;
            case 'payment.failed':
                yield handlePaymentFailed(payload.payment.entity);
                break;
            case 'refund.processed':
                yield handleRefundProcessed(payload.refund.entity);
                break;
            default:
                console.log(`Unhandled webhook event: ${event}`);
        }
        res.status(200).json({ success: true });
        return;
    }
    catch (error) {
        console.error('Webhook processing failed:', error);
        next(error);
    }
});
exports.handleWebhook = handleWebhook;
// Helper function to handle payment captured webhook
const handlePaymentCaptured = (paymentData) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield payment_model_1.Payment.findOne({
        razorpayPaymentId: paymentData.id,
        isDeleted: false
    });
    if (payment) {
        yield payment.markCompleted(paymentData);
        // Update order status
        const order = yield order_model_1.Order.findById(payment.orderId);
        if (order) {
            order.paymentStatus = 'paid';
            order.paymentInfo.status = 'completed';
            order.paymentInfo.transactionId = paymentData.id;
            order.paymentInfo.paymentDate = new Date();
            yield order.save();
        }
    }
});
// Helper function to handle payment failed webhook
const handlePaymentFailed = (paymentData) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield payment_model_1.Payment.findOne({
        razorpayPaymentId: paymentData.id,
        isDeleted: false
    });
    if (payment) {
        yield payment.markFailed(paymentData.error_description || 'Payment failed', paymentData.error_code, paymentData.error_description);
    }
});
// Helper function to handle refund processed webhook
const handleRefundProcessed = (refundData) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield payment_model_1.Payment.findOne({
        razorpayPaymentId: refundData.payment_id,
        isDeleted: false
    });
    if (payment) {
        // Update refund status in payment record
        const refund = payment.refunds.find(r => r.refundId === refundData.id);
        if (refund) {
            refund.status = 'processed';
            refund.processedAt = new Date();
            yield payment.save();
        }
    }
});
// Get payment summary (admin only)
const getPaymentSummary = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { dateFrom, dateTo, userId } = req.query;
        const filter = { isDeleted: false };
        if (userId)
            filter.userId = userId;
        if (dateFrom || dateTo) {
            filter.initiatedAt = {};
            if (dateFrom)
                filter.initiatedAt.$gte = new Date(dateFrom);
            if (dateTo)
                filter.initiatedAt.$lte = new Date(dateTo);
        }
        const [totalPayments, totalAmount, successfulPayments, failedPayments, pendingPayments, totalRefunded, methodBreakdown] = yield Promise.all([
            payment_model_1.Payment.countDocuments(filter),
            payment_model_1.Payment.aggregate([
                { $match: Object.assign(Object.assign({}, filter), { status: 'completed' }) },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            payment_model_1.Payment.countDocuments(Object.assign(Object.assign({}, filter), { status: 'completed' })),
            payment_model_1.Payment.countDocuments(Object.assign(Object.assign({}, filter), { status: 'failed' })),
            payment_model_1.Payment.countDocuments(Object.assign(Object.assign({}, filter), { status: 'pending' })),
            payment_model_1.Payment.aggregate([
                { $match: filter },
                { $group: { _id: null, total: { $sum: '$amountRefunded' } } }
            ]),
            payment_model_1.Payment.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: '$method',
                        count: { $sum: 1 },
                        amount: { $sum: '$amount' }
                    }
                }
            ])
        ]);
        const summary = {
            totalPayments,
            totalAmount: ((_a = totalAmount[0]) === null || _a === void 0 ? void 0 : _a.total) || 0,
            successfulPayments,
            failedPayments,
            pendingPayments,
            totalRefunded: ((_b = totalRefunded[0]) === null || _b === void 0 ? void 0 : _b.total) || 0,
            methodBreakdown: methodBreakdown.map(item => ({
                method: item._id,
                count: item.count,
                amount: item.amount,
            })),
        };
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Payment summary retrieved successfully',
            data: summary,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getPaymentSummary = getPaymentSummary;
