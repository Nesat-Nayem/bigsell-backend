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
exports.getOrderSummary = exports.updatePaymentStatus = exports.returnOrder = exports.cancelOrder = exports.updateOrderStatus = exports.getOrderById = exports.getAllOrders = exports.getUserOrders = exports.getVendorOrderSummary = exports.getVendorOrders = exports.trackDelhiveryForOrder = exports.getDelhiveryLabelForOrder = exports.scheduleDelhiveryPickupForOrder = exports.createDelhiveryShipmentForOrder = exports.getDelhiveryQuote = exports.createOrder = void 0;
const order_model_1 = require("./order.model");
const product_model_1 = require("../product/product.model");
const cart_model_1 = require("../cart/cart.model");
const mongoose_1 = __importDefault(require("mongoose"));
const appError_1 = require("../../errors/appError");
const coupon_model_1 = require("../coupon/coupon.model");
const delhivery_1 = require("../../integrations/delhivery");
// Create new order
const createOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    try {
        const actingUser = req.user;
        const { items, shippingAddress, billingAddress, paymentMethod, shippingMethod, notes, couponCode, user: requestedUserId, } = req.body;
        if (!(actingUser === null || actingUser === void 0 ? void 0 : actingUser._id)) {
            next(new appError_1.appError('User not authenticated', 401));
            return;
        }
        // Determine which user the order should be created for
        let userId = actingUser._id;
        if (requestedUserId) {
            // Only admin can create order on behalf of another user (POS flow)
            if (actingUser.role !== 'admin') {
                next(new appError_1.appError('Only admin can specify user for order creation', 403));
                return;
            }
            if (!mongoose_1.default.Types.ObjectId.isValid(requestedUserId)) {
                next(new appError_1.appError('Invalid user ID', 400));
                return;
            }
            userId = requestedUserId;
        }
        // Validate and process order items
        const orderItems = [];
        let subtotal = 0;
        let orderWeightKg = 0; // accumulate for shipping quote (actual vs volumetric)
        const itemsVendorSubs = [];
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
            // accumulate weight (prefer shippingInfo.weight in kg, fallback to product.weight (grams)); compare with volumetric weight
            let actualWkg = Number((_a = product === null || product === void 0 ? void 0 : product.shippingInfo) === null || _a === void 0 ? void 0 : _a.weight);
            if (!actualWkg || isNaN(actualWkg)) {
                const raw = Number(product === null || product === void 0 ? void 0 : product.weight);
                if (raw && raw > 20)
                    actualWkg = raw / 1000;
                else
                    actualWkg = raw || 0.5;
            }
            if (actualWkg <= 0)
                actualWkg = 0.5;
            // volumetric weight in kg using cm dimensions: L*W*H/5000
            const L = Number((_b = product === null || product === void 0 ? void 0 : product.dimensions) === null || _b === void 0 ? void 0 : _b.length) || 0;
            const W = Number((_c = product === null || product === void 0 ? void 0 : product.dimensions) === null || _c === void 0 ? void 0 : _c.width) || 0;
            const H = Number((_d = product === null || product === void 0 ? void 0 : product.dimensions) === null || _d === void 0 ? void 0 : _d.height) || 0;
            const volumetricWkg = L > 0 && W > 0 && H > 0 ? (L * W * H) / 5000 : 0;
            const effectiveWkg = Math.max(actualWkg, volumetricWkg || 0);
            orderWeightKg += (effectiveWkg || actualWkg) * Number(item.quantity || 1);
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
            // Track vendor eligibility for coupon calculations
            itemsVendorSubs.push({
                vendor: product.vendor ? String(product.vendor) : null,
                subtotal: itemSubtotal,
            });
            // Update product stock
            product.stock -= item.quantity;
            yield product.save();
        }
        // Calculate totals
        let shippingCost = shippingMethod === 'express' ? 100 : 50; // default fallback
        try {
            const originPincode = process.env.DELHIVERY_ORIGIN_PINCODE;
            const destPincode = (shippingAddress === null || shippingAddress === void 0 ? void 0 : shippingAddress.postalCode) || (billingAddress === null || billingAddress === void 0 ? void 0 : billingAddress.postalCode);
            if (process.env.DELHIVERY_API_TOKEN && originPincode && destPincode) {
                const quote = yield (0, delhivery_1.delhiveryInvoiceCharges)({
                    originPincode: String(originPincode),
                    destPincode: String(destPincode),
                    weightGrams: Math.max(500, Math.round(orderWeightKg * 1000)),
                    paymentMode: (paymentMethod === 'cash_on_delivery') ? 'COD' : 'Pre-paid',
                    client: process.env.DELHIVERY_CLIENT,
                });
                let fee = Number(((_f = (_e = quote === null || quote === void 0 ? void 0 : quote.total_amount) !== null && _e !== void 0 ? _e : quote === null || quote === void 0 ? void 0 : quote.totalAmount) !== null && _f !== void 0 ? _f : quote === null || quote === void 0 ? void 0 : quote.total) || 0);
                if (Array.isArray(quote) && quote.length) {
                    fee = Number(((_k = (_h = (_g = quote[0]) === null || _g === void 0 ? void 0 : _g.total_amount) !== null && _h !== void 0 ? _h : (_j = quote[0]) === null || _j === void 0 ? void 0 : _j.totalAmount) !== null && _k !== void 0 ? _k : (_l = quote[0]) === null || _l === void 0 ? void 0 : _l.total) || 0);
                }
                if (!isNaN(fee) && fee > 0)
                    shippingCost = fee;
            }
        }
        catch (e) {
            // ignore quote failures, keep fallback shipping cost
        }
        const tax = 0; // No tax
        let discount = 0;
        // Apply coupon if provided (admin global or vendor-specific)
        if (couponCode) {
            const code = String(couponCode).trim().toUpperCase();
            const c = yield coupon_model_1.Coupon.findOne({ code, isDeleted: false });
            const now = new Date();
            if (c &&
                c.status === 'active' &&
                new Date(c.startDate) <= now &&
                new Date(c.endDate) >= now) {
                let eligible = 0;
                if (c.vendor) {
                    eligible = itemsVendorSubs
                        .filter((x) => String(x.vendor) === String(c.vendor))
                        .reduce((a, b) => a + b.subtotal, 0);
                }
                else {
                    eligible = subtotal;
                }
                let amount = 0;
                if (c.discountType === 'percentage') {
                    amount = (eligible * Number(c.discountValue || 0)) / 100;
                    if (c.maxDiscountAmount != null) {
                        amount = Math.min(amount, Number(c.maxDiscountAmount));
                    }
                }
                else {
                    amount = Math.min(Number(c.discountValue || 0), eligible);
                }
                if (c.minOrderAmount != null && eligible < Number(c.minOrderAmount)) {
                    amount = 0;
                }
                discount = Math.max(0, amount);
            }
        }
        const totalAmount = subtotal + shippingCost - discount;
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
// Get approximate Delhivery shipping charges (for checkout)
const getDelhiveryQuote = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    try {
        const { items, destPincode, paymentMode = 'Pre-paid', service } = req.body || {};
        const originPincode = process.env.DELHIVERY_ORIGIN_PINCODE;
        if (!process.env.DELHIVERY_API_TOKEN)
            return next(new appError_1.appError('Delhivery token not configured', 500));
        if (!originPincode)
            return next(new appError_1.appError('DELHIVERY_ORIGIN_PINCODE not configured', 500));
        if (!destPincode || String(destPincode).length < 4)
            return next(new appError_1.appError('Destination pincode required', 400));
        if (!Array.isArray(items) || items.length === 0)
            return next(new appError_1.appError('Items required', 400));
        // Fetch products to compute total weight in grams
        const productIds = [];
        const qtyMap = {};
        for (const it of items) {
            const id = String(it.productId || it.product || '');
            if (mongoose_1.default.Types.ObjectId.isValid(id)) {
                productIds.push(id);
                qtyMap[id] = (qtyMap[id] || 0) + Math.max(1, Number(it.quantity || 1));
            }
        }
        const prods = yield product_model_1.Product.find({ _id: { $in: productIds }, isDeleted: false }, { weight: 1, shippingInfo: 1, dimensions: 1 }).lean();
        let totalGrams = 0;
        for (const p of prods) {
            const q = qtyMap[String(p._id)] || 1;
            let actualWkg = Number((_a = p === null || p === void 0 ? void 0 : p.shippingInfo) === null || _a === void 0 ? void 0 : _a.weight);
            if (!actualWkg || isNaN(actualWkg)) {
                const raw = Number(p === null || p === void 0 ? void 0 : p.weight);
                if (raw && raw > 20)
                    actualWkg = raw / 1000;
                else
                    actualWkg = raw || 0.5;
            }
            if (actualWkg <= 0)
                actualWkg = 0.5;
            const L = Number((_b = p === null || p === void 0 ? void 0 : p.dimensions) === null || _b === void 0 ? void 0 : _b.length) || 0;
            const W = Number((_c = p === null || p === void 0 ? void 0 : p.dimensions) === null || _c === void 0 ? void 0 : _c.width) || 0;
            const H = Number((_d = p === null || p === void 0 ? void 0 : p.dimensions) === null || _d === void 0 ? void 0 : _d.height) || 0;
            const volumetricWkg = L > 0 && W > 0 && H > 0 ? (L * W * H) / 5000 : 0;
            const effectiveWkg = Math.max(actualWkg, volumetricWkg || 0);
            totalGrams += Math.round((effectiveWkg || actualWkg) * 1000) * q;
        }
        if (totalGrams <= 0)
            totalGrams = 500;
        const quote = yield (0, delhivery_1.delhiveryInvoiceCharges)({
            originPincode: String(originPincode),
            destPincode: String(destPincode),
            weightGrams: totalGrams,
            paymentMode: paymentMode === 'COD' ? 'COD' : 'Pre-paid',
            service,
            client: process.env.DELHIVERY_CLIENT,
        });
        let shippingFee = Number(((_f = (_e = quote === null || quote === void 0 ? void 0 : quote.total_amount) !== null && _e !== void 0 ? _e : quote === null || quote === void 0 ? void 0 : quote.totalAmount) !== null && _f !== void 0 ? _f : quote === null || quote === void 0 ? void 0 : quote.total) || 0);
        if (Array.isArray(quote) && quote.length) {
            shippingFee = Number(((_k = (_h = (_g = quote[0]) === null || _g === void 0 ? void 0 : _g.total_amount) !== null && _h !== void 0 ? _h : (_j = quote[0]) === null || _j === void 0 ? void 0 : _j.totalAmount) !== null && _k !== void 0 ? _k : (_l = quote[0]) === null || _l === void 0 ? void 0 : _l.total) || 0);
        }
        return res.status(200).json({ success: true, statusCode: 200, message: 'Quote fetched', data: { shippingFee, quote } });
    }
    catch (error) {
        next(error);
    }
});
exports.getDelhiveryQuote = getDelhiveryQuote;
// Create Delhivery shipment for an order (admin/vendor)
const createDelhiveryShipmentForOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return next(new appError_1.appError('Invalid order ID', 400));
        }
        // ensure token configured
        if (!process.env.DELHIVERY_API_TOKEN) {
            return next(new appError_1.appError('Delhivery token not configured', 500));
        }
        const order = yield order_model_1.Order.findOne({ _id: id, isDeleted: false })
            .populate('items.product', 'weight shippingInfo name')
            .populate('user', 'name email phone')
            .lean();
        if (!order)
            return next(new appError_1.appError('Order not found', 404));
        // Build consignee from shippingAddress
        const ship = order.shippingAddress || {};
        if (!(ship === null || ship === void 0 ? void 0 : ship.fullName) || !(ship === null || ship === void 0 ? void 0 : ship.addressLine1) || !(ship === null || ship === void 0 ? void 0 : ship.city) || !(ship === null || ship === void 0 ? void 0 : ship.state) || !(ship === null || ship === void 0 ? void 0 : ship.postalCode)) {
            return next(new appError_1.appError('Order missing shipping address details required for shipment', 400));
        }
        const phone = ship.phone || ((_a = order === null || order === void 0 ? void 0 : order.user) === null || _a === void 0 ? void 0 : _a.phone);
        if (!phone) {
            return next(new appError_1.appError('Shipping phone number is required for Delhivery', 400));
        }
        const pincode = String(ship.postalCode || '').trim();
        if (!/^\d{6}$/.test(pincode)) {
            return next(new appError_1.appError('Shipping postal code must be a valid 6-digit pincode for Delhivery', 400));
        }
        // Compute total weight (kg) with unit normalization
        let totalWeight = 0;
        const items = order.items || [];
        for (const it of items) {
            const p = it.product || {};
            const w = (_d = (_c = (_b = p === null || p === void 0 ? void 0 : p.shippingInfo) === null || _b === void 0 ? void 0 : _b.weight) !== null && _c !== void 0 ? _c : p === null || p === void 0 ? void 0 : p.weight) !== null && _d !== void 0 ? _d : 0.5;
            let wkg = Number(w) || 0.5;
            if (((_e = p === null || p === void 0 ? void 0 : p.shippingInfo) === null || _e === void 0 ? void 0 : _e.weight) == null && typeof (p === null || p === void 0 ? void 0 : p.weight) === 'number' && p.weight > 20) {
                wkg = Number(p.weight) / 1000; // assume grams -> kg
            }
            if (wkg <= 0)
                wkg = 0.5;
            totalWeight += wkg * Number(it.quantity || 1);
        }
        if (totalWeight <= 0)
            totalWeight = 0.5;
        const paymentMode = order.paymentStatus === 'paid' ? 'Prepaid' : 'COD';
        const payload = {
            orderId: String(order._id),
            orderNumber: String(order.orderNumber || order._id),
            consignee: {
                name: ship.fullName,
                phone,
                email: ship.email || ((_f = order === null || order === void 0 ? void 0 : order.user) === null || _f === void 0 ? void 0 : _f.email),
                address1: ship.addressLine1,
                address2: ship.addressLine2,
                city: ship.city,
                state: ship.state,
                pincode: pincode,
                country: ship.country || 'India',
            },
            paymentMode: paymentMode,
            invoiceValue: Number(order.totalAmount || 0),
            codAmount: paymentMode === 'COD' ? Number(order.totalAmount || 0) : 0,
            weightKg: Number(totalWeight.toFixed(2)),
            quantity: Math.max(1, Number(items.length) || 1),
            pickup: {
                location: process.env.DELHIVERY_PICKUP_LOCATION,
            },
            client: process.env.DELHIVERY_CLIENT,
        };
        const dlvRes = yield (0, delhivery_1.delhiveryCreateShipment)(payload);
        // Try to extract waybill from various possible response shapes
        const waybill = ((dlvRes === null || dlvRes === void 0 ? void 0 : dlvRes.packages) && ((_g = dlvRes.packages[0]) === null || _g === void 0 ? void 0 : _g.waybill)) || (dlvRes === null || dlvRes === void 0 ? void 0 : dlvRes.waybill) || (dlvRes === null || dlvRes === void 0 ? void 0 : dlvRes.wayBill) || (dlvRes === null || dlvRes === void 0 ? void 0 : dlvRes.awb) || '';
        if (!waybill) {
            return res.status(200).json({ success: true, statusCode: 200, message: 'Delhivery shipment created (no waybill found in response)', data: { order, dlvRes } });
        }
        // Update order with tracking number and mark shipped
        const updated = yield order_model_1.Order.findById(id);
        if (updated) {
            updated.trackingNumber = waybill;
            if (updated.status !== 'shipped') {
                updated.statusHistory.push({ status: 'shipped', timestamp: new Date(), note: 'Marked shipped after Delhivery AWB generation' });
                updated.status = 'shipped';
                updated.shippedAt = new Date();
            }
            yield updated.save();
        }
        const populatedOrder = yield order_model_1.Order.findById(id)
            .populate('user', 'name email phone')
            .populate('items.product', 'name price images thumbnail');
        return res.status(200).json({ success: true, statusCode: 200, message: 'Delhivery shipment created', data: { order: populatedOrder, waybill, dlvRes } });
    }
    catch (error) {
        next(error);
    }
});
exports.createDelhiveryShipmentForOrder = createDelhiveryShipmentForOrder;
// Schedule Delhivery pickup (admin/vendor)
const scheduleDelhiveryPickupForOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return next(new appError_1.appError('Invalid order ID', 400));
        if (!process.env.DELHIVERY_API_TOKEN)
            return next(new appError_1.appError('Delhivery token not configured', 500));
        if (!process.env.DELHIVERY_PICKUP_LOCATION)
            return next(new appError_1.appError('Delhivery pickup location not configured', 500));
        const order = yield order_model_1.Order.findOne({ _id: id, isDeleted: false });
        if (!order)
            return next(new appError_1.appError('Order not found', 404));
        const { expectedPackageCount, pickup } = req.body || {};
        const derivedCount = Math.max(1, Number(expectedPackageCount || ((_a = order.items) === null || _a === void 0 ? void 0 : _a.length) || 1));
        const dlvRes = yield (0, delhivery_1.delhiverySchedulePickup)({
            expectedPackageCount: derivedCount,
            pickup: {
                location: (pickup && pickup.location) || process.env.DELHIVERY_PICKUP_LOCATION,
                date: pickup === null || pickup === void 0 ? void 0 : pickup.date,
                time: pickup === null || pickup === void 0 ? void 0 : pickup.time,
            },
        });
        return res.status(200).json({ success: true, statusCode: 200, message: 'Pickup scheduled', data: { dlvRes } });
    }
    catch (error) {
        next(error);
    }
});
exports.scheduleDelhiveryPickupForOrder = scheduleDelhiveryPickupForOrder;
// Get Delhivery shipping label (PDF base64)
const getDelhiveryLabelForOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return next(new appError_1.appError('Invalid order ID', 400));
        if (!process.env.DELHIVERY_API_TOKEN)
            return next(new appError_1.appError('Delhivery token not configured', 500));
        const order = yield order_model_1.Order.findOne({ _id: id, isDeleted: false });
        if (!order)
            return next(new appError_1.appError('Order not found', 404));
        if (!order.trackingNumber)
            return next(new appError_1.appError('No tracking number found for this order', 400));
        const pdf = yield (0, delhivery_1.delhiveryLabel)([order.trackingNumber]);
        return res.status(200).json({ success: true, statusCode: 200, message: 'Label fetched', data: pdf });
    }
    catch (error) {
        next(error);
    }
});
exports.getDelhiveryLabelForOrder = getDelhiveryLabelForOrder;
// Track Delhivery shipment for an order
const trackDelhiveryForOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return next(new appError_1.appError('Invalid order ID', 400));
        if (!process.env.DELHIVERY_API_TOKEN)
            return next(new appError_1.appError('Delhivery token not configured', 500));
        const order = yield order_model_1.Order.findOne({ _id: id, isDeleted: false });
        if (!order)
            return next(new appError_1.appError('Order not found', 404));
        if (!order.trackingNumber)
            return next(new appError_1.appError('No tracking number found for this order', 400));
        const tracking = yield (0, delhivery_1.delhiveryTrack)(order.trackingNumber);
        return res.status(200).json({ success: true, statusCode: 200, message: 'Tracking fetched', data: tracking });
    }
    catch (error) {
        next(error);
    }
});
exports.trackDelhiveryForOrder = trackDelhiveryForOrder;
// Get vendor's orders (orders that include products owned by the vendor)
const getVendorOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { page = 1, limit = 10, status, paymentStatus, dateFrom, dateTo, sort = '-orderDate' } = req.query;
        if (!vendorId) {
            next(new appError_1.appError('User not authenticated', 401));
            return;
        }
        // Find product ids owned by vendor
        const vendorProductIds = yield product_model_1.Product.find({ vendor: vendorId, isDeleted: false }).distinct('_id');
        if (vendorProductIds.length === 0) {
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Orders retrieved successfully',
                meta: {
                    page: Number(page),
                    limit: Number(limit),
                    total: 0,
                    totalPages: 0,
                    hasPrevPage: false,
                    hasNextPage: false,
                },
                data: [],
            });
        }
        const filter = {
            isDeleted: false,
            'items.product': { $in: vendorProductIds },
        };
        if (status)
            filter.status = status;
        if (paymentStatus)
            filter.paymentStatus = paymentStatus;
        if (dateFrom || dateTo) {
            filter.orderDate = {};
            if (dateFrom)
                filter.orderDate.$gte = new Date(String(dateFrom));
            if (dateTo)
                filter.orderDate.$lte = new Date(String(dateTo));
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [orders, total] = yield Promise.all([
            order_model_1.Order.find(filter)
                .populate('user', 'name email phone')
                .populate('items.product', 'name price images thumbnail')
                .sort(String(sort))
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
                hasPrevPage: Number(page) > 1,
                hasNextPage: Number(page) < totalPages,
            },
            data: orders,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getVendorOrders = getVendorOrders;
// Get vendor-specific order summary/statistics
const getVendorOrderSummary = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!vendorId) {
            next(new appError_1.appError('User not authenticated', 401));
            return;
        }
        // Get vendor product ids
        const vendorProductIds = yield product_model_1.Product.find({ vendor: vendorId, isDeleted: false }).distinct('_id');
        if (vendorProductIds.length === 0) {
            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Order summary retrieved successfully',
                data: {
                    totalOrders: 0,
                    pendingOrders: 0,
                    completedOrders: 0,
                    totalRevenue: 0,
                    monthlyRevenue: Array(12).fill(0),
                    monthlyOrders: Array(12).fill(0),
                },
            });
        }
        // Summary counts
        const [totalOrders, pendingOrders, completedOrders] = yield Promise.all([
            order_model_1.Order.countDocuments({ isDeleted: false, 'items.product': { $in: vendorProductIds } }),
            order_model_1.Order.countDocuments({ status: 'pending', isDeleted: false, 'items.product': { $in: vendorProductIds } }),
            order_model_1.Order.countDocuments({ status: 'delivered', isDeleted: false, 'items.product': { $in: vendorProductIds } }),
        ]);
        // Compute vendor-specific revenue and monthly stats using aggregation
        const now = new Date();
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        const [totalRevenueAgg, monthlyAggDelivered, monthlyAggAll] = yield Promise.all([
            order_model_1.Order.aggregate([
                { $match: { status: 'delivered', isDeleted: false, 'items.product': { $in: vendorProductIds } } },
                { $addFields: {
                        vendorItems: {
                            $filter: {
                                input: '$items',
                                as: 'it',
                                cond: { $in: ['$$it.product', vendorProductIds] },
                            }
                        }
                    } },
                { $group: { _id: null, total: { $sum: { $sum: '$vendorItems.subtotal' } } } },
            ]),
            order_model_1.Order.aggregate([
                { $match: { status: 'delivered', isDeleted: false, orderDate: { $gte: yearStart, $lte: yearEnd }, 'items.product': { $in: vendorProductIds } } },
                { $addFields: {
                        vendorItems: {
                            $filter: { input: '$items', as: 'it', cond: { $in: ['$$it.product', vendorProductIds] } }
                        }
                    } },
                { $group: { _id: { $month: '$orderDate' }, revenue: { $sum: { $sum: '$vendorItems.subtotal' } }, count: { $sum: 1 } } },
            ]),
            order_model_1.Order.aggregate([
                { $match: { isDeleted: false, orderDate: { $gte: yearStart, $lte: yearEnd }, 'items.product': { $in: vendorProductIds } } },
                { $group: { _id: { $month: '$orderDate' }, count: { $sum: 1 } } },
            ]),
        ]);
        const monthlyRevenue = Array(12).fill(0);
        const monthlyOrders = Array(12).fill(0);
        monthlyAggDelivered.forEach((row) => {
            const idx = row._id - 1;
            if (idx >= 0 && idx < 12)
                monthlyRevenue[idx] = row.revenue || 0;
        });
        monthlyAggAll.forEach((row) => {
            const idx = row._id - 1;
            if (idx >= 0 && idx < 12)
                monthlyOrders[idx] = row.count || 0;
        });
        const summary = {
            totalOrders,
            pendingOrders,
            completedOrders,
            totalRevenue: ((_b = totalRevenueAgg === null || totalRevenueAgg === void 0 ? void 0 : totalRevenueAgg[0]) === null || _b === void 0 ? void 0 : _b.total) || 0,
            monthlyRevenue,
            monthlyOrders,
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
exports.getVendorOrderSummary = getVendorOrderSummary;
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
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            next(new appError_1.appError('Invalid order ID', 400));
            return;
        }
        const filter = { _id: id, isDeleted: false };
        // Non-admin users: allow customer to view their order,
        // and allow vendor to view if the order contains their products
        if (userRole !== 'admin') {
            if (userRole === 'user') {
                filter.user = userId;
            }
        }
        let order = yield order_model_1.Order.findOne(filter)
            .populate('user', 'name email phone')
            .populate('items.product', 'name price images thumbnail')
            .lean();
        // If vendor and not found by above filter (because not the customer),
        // check if the order contains any of the vendor's products
        if (!order && userRole === 'vendor') {
            const vendorProductIds = yield product_model_1.Product.find({ vendor: userId, isDeleted: false }).distinct('_id');
            order = yield order_model_1.Order.findOne({ _id: id, isDeleted: false, 'items.product': { $in: vendorProductIds } })
                .populate('user', 'name email phone')
                .populate('items.product', 'name price images thumbnail')
                .lean();
        }
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
        const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
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
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
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
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
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
        // Validate and map payment status
        const allowedStatuses = ['pending', 'paid', 'failed', 'refunded'];
        if (!paymentStatus || !allowedStatuses.includes(paymentStatus)) {
            next(new appError_1.appError('Invalid payment status', 400));
            return;
        }
        // Map UI 'paid' -> paymentInfo.status 'completed' (schema enum)
        const paymentInfoStatusMap = {
            pending: 'pending',
            paid: 'completed',
            failed: 'failed',
            refunded: 'refunded',
        };
        order.paymentStatus = paymentStatus;
        order.paymentInfo.status = paymentInfoStatusMap[paymentStatus];
        if (transactionId)
            order.paymentInfo.transactionId = transactionId;
        if (paymentDate)
            order.paymentInfo.paymentDate = new Date(paymentDate);
        if (paymentStatus === 'paid' && !paymentDate)
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
        // Build monthly revenue and orders for the current year
        const now = new Date();
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        // Delivered only: revenue + count (for monthlyRevenue)
        const monthlyAggDelivered = yield order_model_1.Order.aggregate([
            {
                $match: {
                    status: 'delivered',
                    isDeleted: false,
                    orderDate: { $gte: yearStart, $lte: yearEnd },
                },
            },
            {
                $group: {
                    _id: { $month: '$orderDate' },
                    revenue: { $sum: '$totalAmount' },
                    count: { $sum: 1 },
                },
            },
        ]);
        // All orders: count only (for monthlyOrders series)
        const monthlyAggAll = yield order_model_1.Order.aggregate([
            {
                $match: {
                    isDeleted: false,
                    orderDate: { $gte: yearStart, $lte: yearEnd },
                },
            },
            {
                $group: {
                    _id: { $month: '$orderDate' },
                    count: { $sum: 1 },
                },
            },
        ]);
        const monthlyRevenue = Array(12).fill(0);
        const monthlyOrders = Array(12).fill(0);
        monthlyAggDelivered.forEach((row) => {
            const idx = row._id - 1; // months are 1..12
            if (idx >= 0 && idx < 12) {
                monthlyRevenue[idx] = row.revenue || 0;
            }
        });
        monthlyAggAll.forEach((row) => {
            const idx = row._id - 1;
            if (idx >= 0 && idx < 12) {
                monthlyOrders[idx] = row.count || 0;
            }
        });
        const summary = {
            totalOrders,
            pendingOrders,
            completedOrders,
            totalRevenue: ((_a = totalRevenue[0]) === null || _a === void 0 ? void 0 : _a.total) || 0,
            monthlyRevenue,
            monthlyOrders,
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
