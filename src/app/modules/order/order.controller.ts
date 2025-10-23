import { NextFunction, Request, Response } from 'express';
import { Order } from './order.model';
import { Product } from '../product/product.model';
import { Cart } from '../cart/cart.model';
import mongoose from 'mongoose';
import { appError } from '../../errors/appError';
import { Coupon } from '../coupon/coupon.model';
import { delhiveryCreateShipment, delhiverySchedulePickup, delhiveryTrack, delhiveryLabel, delhiveryInvoiceCharges } from '../../integrations/delhivery';

// Create new order
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const actingUser = (req as any).user;
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      shippingMethod,
      notes,
      couponCode,
      user: requestedUserId,
    } = req.body as any;

    if (!actingUser?._id) {
      next(new appError('User not authenticated', 401));
      return;
    }

    // Determine which user the order should be created for
    let userId = actingUser._id;
    if (requestedUserId) {
      // Only admin can create order on behalf of another user (POS flow)
      if (actingUser.role !== 'admin') {
        next(new appError('Only admin can specify user for order creation', 403));
        return;
      }
      if (!mongoose.Types.ObjectId.isValid(requestedUserId)) {
        next(new appError('Invalid user ID', 400));
        return;
      }
      userId = requestedUserId;
    }

    // Validate and process order items
    const orderItems = [];
    let subtotal = 0;
    let orderWeightKg = 0; // accumulate for shipping quote
    const itemsVendorSubs: Array<{ vendor?: string | null; subtotal: number }> = [];

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        next(new appError(`Invalid product ID: ${item.productId}`, 400));
        return;
      }

      const product = await Product.findOne({ 
        _id: item.productId, 
        isDeleted: false, 
        status: 'active' 
      });

      if (!product) {
        next(new appError(`Product not found: ${item.productId}`, 404));
        return;
      }

      if (product.stock < item.quantity) {
        next(new appError(`Insufficient stock for ${product.name}. Available: ${product.stock}`, 400));
        return;
      }

      // Check color/size availability
      if (item.selectedColor && product.colors && !product.colors.includes(item.selectedColor)) {
        next(new appError(`Color ${item.selectedColor} not available for ${product.name}`, 400));
        return;
      }

      if (item.selectedSize && product.sizes && !product.sizes.includes(item.selectedSize)) {
        next(new appError(`Size ${item.selectedSize} not available for ${product.name}`, 400));
        return;
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      // accumulate weight (prefer shippingInfo.weight in kg, fallback to product.weight which may be grams)
      let wkg = Number((product as any)?.shippingInfo?.weight);
      if (!wkg || isNaN(wkg)) {
        const raw = Number((product as any)?.weight);
        if (raw && raw > 20) wkg = raw / 1000; else wkg = raw || 0.5;
      }
      if (wkg <= 0) wkg = 0.5;
      orderWeightKg += wkg * Number(item.quantity || 1);

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
      await product.save();
    }

    // Calculate totals
    let shippingCost = shippingMethod === 'express' ? 100 : 50; // default fallback
    try {
      const originPincode = process.env.DELHIVERY_ORIGIN_PINCODE;
      const destPincode = (shippingAddress as any)?.postalCode || (billingAddress as any)?.postalCode;
      if (process.env.DELHIVERY_API_TOKEN && originPincode && destPincode) {
        const quote = await delhiveryInvoiceCharges({
          originPincode: String(originPincode),
          destPincode: String(destPincode),
          weightGrams: Math.max(500, Math.round(orderWeightKg * 1000)),
          paymentMode: (paymentMethod === 'cash_on_delivery') ? 'COD' : 'Pre-paid',
          client: process.env.DELHIVERY_CLIENT,
        } as any);
        const fee = Number((quote?.total_amount ?? quote?.totalAmount ?? quote?.total) || 0);
        if (!isNaN(fee) && fee > 0) shippingCost = fee;
      }
    } catch (e) {
      // ignore quote failures, keep fallback shipping cost
    }
    const tax = subtotal * 0.05; // 5% tax
    let discount = 0;

    // Apply coupon if provided (admin global or vendor-specific)
    if (couponCode) {
      const code = String(couponCode).trim().toUpperCase();
      const c: any = await Coupon.findOne({ code, isDeleted: false });
      const now = new Date();
      if (
        c &&
        c.status === 'active' &&
        new Date(c.startDate) <= now &&
        new Date(c.endDate) >= now
      ) {
        let eligible = 0;
        if (c.vendor) {
          eligible = itemsVendorSubs
            .filter((x) => String(x.vendor) === String(c.vendor))
            .reduce((a, b) => a + b.subtotal, 0);
        } else {
          eligible = subtotal;
        }

        let amount = 0;
        if (c.discountType === 'percentage') {
          amount = (eligible * Number(c.discountValue || 0)) / 100;
          if (c.maxDiscountAmount != null) {
            amount = Math.min(amount, Number(c.maxDiscountAmount));
          }
        } else {
          amount = Math.min(Number(c.discountValue || 0), eligible);
        }
        if (c.minOrderAmount != null && eligible < Number(c.minOrderAmount)) {
          amount = 0;
        }
        discount = Math.max(0, amount);
      }
    }

    const totalAmount = subtotal + shippingCost + tax - discount;

    // Create order
    const order = new Order({
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

    await order.save();

    // Clear user's cart after successful order
    try {
      const userCart = await Cart.findOne({ user: userId, isDeleted: false });
      if (userCart) {
        await (userCart as any).clearCart();
      }
    } catch (error) {
      // Cart clearing failure shouldn't fail the order
      console.log('Failed to clear cart:', error);
    }

    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images thumbnail');

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Order created successfully',
      data: populatedOrder,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get approximate Delhivery shipping charges (for checkout)
export const getDelhiveryQuote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { items, destPincode, paymentMode = 'Pre-paid', service } = req.body || {};
    const originPincode = process.env.DELHIVERY_ORIGIN_PINCODE;
    if (!process.env.DELHIVERY_API_TOKEN) return next(new appError('Delhivery token not configured', 500));
    if (!originPincode) return next(new appError('DELHIVERY_ORIGIN_PINCODE not configured', 500));
    if (!destPincode || String(destPincode).length < 4) return next(new appError('Destination pincode required', 400));
    if (!Array.isArray(items) || items.length === 0) return next(new appError('Items required', 400));

    // Fetch products to compute total weight in grams
    const productIds: string[] = [];
    const qtyMap: Record<string, number> = {};
    for (const it of items) {
      const id = String(it.productId || it.product || '');
      if (mongoose.Types.ObjectId.isValid(id)) {
        productIds.push(id);
        qtyMap[id] = (qtyMap[id] || 0) + Math.max(1, Number(it.quantity || 1));
      }
    }
    const prods = await Product.find({ _id: { $in: productIds }, isDeleted: false }, { weight: 1, shippingInfo: 1 }).lean();
    let totalGrams = 0;
    for (const p of prods as any[]) {
      const q = qtyMap[String(p._id)] || 1;
      let wkg = Number(p?.shippingInfo?.weight);
      if (!wkg || isNaN(wkg)) {
        const raw = Number(p?.weight);
        if (raw && raw > 20) wkg = raw / 1000; else wkg = raw || 0.5;
      }
      if (wkg <= 0) wkg = 0.5;
      totalGrams += Math.round(wkg * 1000) * q;
    }
    if (totalGrams <= 0) totalGrams = 500;

    const quote = await delhiveryInvoiceCharges({
      originPincode: String(originPincode),
      destPincode: String(destPincode),
      weightGrams: totalGrams,
      paymentMode: paymentMode === 'COD' ? 'COD' : 'Pre-paid',
      service,
      client: process.env.DELHIVERY_CLIENT,
    } as any);

    const shippingFee = Number((quote?.total_amount ?? quote?.totalAmount ?? quote?.total) || 0);
    return res.status(200).json({ success: true, statusCode: 200, message: 'Quote fetched', data: { shippingFee, quote } });
  } catch (error) {
    next(error);
  }
};

// Create Delhivery shipment for an order (admin/vendor)
export const createDelhiveryShipmentForOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new appError('Invalid order ID', 400));
    }

    // ensure token configured
    if (!process.env.DELHIVERY_API_TOKEN) {
      return next(new appError('Delhivery token not configured', 500));
    }

    const order = await Order.findOne({ _id: id, isDeleted: false })
      .populate('items.product', 'weight shippingInfo name')
      .populate('user', 'name email phone')
      .lean();
    if (!order) return next(new appError('Order not found', 404));

    // Build consignee from shippingAddress
    const ship = (order as any).shippingAddress || {};
    if (!ship?.fullName || !ship?.addressLine1 || !ship?.city || !ship?.state || !ship?.postalCode) {
      return next(new appError('Order missing shipping address details required for shipment', 400));
    }
    const phone = ship.phone || (order as any)?.user?.phone;
    if (!phone) {
      return next(new appError('Shipping phone number is required for Delhivery', 400));
    }
    const pincode = String(ship.postalCode || '').trim();
    if (!/^\d{6}$/.test(pincode)) {
      return next(new appError('Shipping postal code must be a valid 6-digit pincode for Delhivery', 400));
    }

    // Compute total weight (kg) with unit normalization
    let totalWeight = 0;
    const items = (order as any).items || [];
    for (const it of items) {
      const p: any = it.product || {};
      const w = p?.shippingInfo?.weight ?? p?.weight ?? 0.5;
      let wkg = Number(w) || 0.5;
      if (p?.shippingInfo?.weight == null && typeof p?.weight === 'number' && p.weight > 20) {
        wkg = Number(p.weight) / 1000; // assume grams -> kg
      }
      if (wkg <= 0) wkg = 0.5;
      totalWeight += wkg * Number(it.quantity || 1);
    }
    if (totalWeight <= 0) totalWeight = 0.5;

    const paymentMode = (order as any).paymentStatus === 'paid' ? 'Prepaid' : 'COD';
    const payload = {
      orderId: String(order._id),
      orderNumber: String((order as any).orderNumber || order._id),
      consignee: {
        name: ship.fullName,
        phone,
        email: ship.email || (order as any)?.user?.email,
        address1: ship.addressLine1,
        address2: ship.addressLine2,
        city: ship.city,
        state: ship.state,
        pincode: pincode,
        country: ship.country || 'India',
      },
      paymentMode: paymentMode as 'Prepaid' | 'COD',
      invoiceValue: Number((order as any).totalAmount || 0),
      codAmount: paymentMode === 'COD' ? Number((order as any).totalAmount || 0) : 0,
      weightKg: Number(totalWeight.toFixed(2)),
      quantity: Math.max(1, Number(items.length) || 1),
      pickup: {
        location: process.env.DELHIVERY_PICKUP_LOCATION,
      },
      client: process.env.DELHIVERY_CLIENT,
    };

    const dlvRes = await delhiveryCreateShipment(payload);
    // Try to extract waybill from various possible response shapes
    const waybill = (dlvRes?.packages && dlvRes.packages[0]?.waybill) || dlvRes?.waybill || dlvRes?.wayBill || dlvRes?.awb || '';
    if (!waybill) {
      return res.status(200).json({ success: true, statusCode: 200, message: 'Delhivery shipment created (no waybill found in response)', data: { order, dlvRes } });
    }

    // Update order with tracking number and mark shipped
    const updated = await Order.findById(id);
    if (updated) {
      updated.trackingNumber = waybill;
      if (updated.status !== 'shipped') {
        (updated as any).statusHistory.push({ status: 'shipped', timestamp: new Date(), note: 'Marked shipped after Delhivery AWB generation' });
        updated.status = 'shipped';
        updated.shippedAt = new Date();
      }
      await updated.save();
    }

    const populatedOrder = await Order.findById(id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images thumbnail');

    return res.status(200).json({ success: true, statusCode: 200, message: 'Delhivery shipment created', data: { order: populatedOrder, waybill, dlvRes } });
  } catch (error) {
    next(error);
  }
};

// Schedule Delhivery pickup (admin/vendor)
export const scheduleDelhiveryPickupForOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return next(new appError('Invalid order ID', 400));
    if (!process.env.DELHIVERY_API_TOKEN) return next(new appError('Delhivery token not configured', 500));
    if (!process.env.DELHIVERY_PICKUP_LOCATION) return next(new appError('Delhivery pickup location not configured', 500));

    const order = await Order.findOne({ _id: id, isDeleted: false });
    if (!order) return next(new appError('Order not found', 404));

    const { expectedPackageCount, pickup } = req.body || {};
    const derivedCount = Math.max(1, Number(expectedPackageCount || (order as any).items?.length || 1));
    const dlvRes = await delhiverySchedulePickup({
      expectedPackageCount: derivedCount,
      pickup: {
        location: (pickup && pickup.location) || process.env.DELHIVERY_PICKUP_LOCATION,
        date: pickup?.date,
        time: pickup?.time,
      },
    });
    return res.status(200).json({ success: true, statusCode: 200, message: 'Pickup scheduled', data: { dlvRes } });
  } catch (error) {
    next(error);
  }
};

// Get Delhivery shipping label (PDF base64)
export const getDelhiveryLabelForOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return next(new appError('Invalid order ID', 400));
    if (!process.env.DELHIVERY_API_TOKEN) return next(new appError('Delhivery token not configured', 500));

    const order = await Order.findOne({ _id: id, isDeleted: false });
    if (!order) return next(new appError('Order not found', 404));
    if (!order.trackingNumber) return next(new appError('No tracking number found for this order', 400));

    const pdf = await delhiveryLabel([order.trackingNumber]);
    return res.status(200).json({ success: true, statusCode: 200, message: 'Label fetched', data: pdf });
  } catch (error) {
    next(error);
  }
};

// Track Delhivery shipment for an order
export const trackDelhiveryForOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return next(new appError('Invalid order ID', 400));
    if (!process.env.DELHIVERY_API_TOKEN) return next(new appError('Delhivery token not configured', 500));

    const order = await Order.findOne({ _id: id, isDeleted: false });
    if (!order) return next(new appError('Order not found', 404));
    if (!order.trackingNumber) return next(new appError('No tracking number found for this order', 400));

    const tracking = await delhiveryTrack(order.trackingNumber);
    return res.status(200).json({ success: true, statusCode: 200, message: 'Tracking fetched', data: tracking });
  } catch (error) {
    next(error);
  }
};

// Get vendor's orders (orders that include products owned by the vendor)
export const getVendorOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendorId = (req as any).user?._id;
    const { page = 1, limit = 10, status, paymentStatus, dateFrom, dateTo, sort = '-orderDate' } = req.query as any;

    if (!vendorId) {
      next(new appError('User not authenticated', 401));
      return;
    }

    // Find product ids owned by vendor
    const vendorProductIds = await Product.find({ vendor: vendorId, isDeleted: false }).distinct('_id');

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

    const filter: any = {
      isDeleted: false,
      'items.product': { $in: vendorProductIds },
    };

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (dateFrom || dateTo) {
      filter.orderDate = {};
      if (dateFrom) filter.orderDate.$gte = new Date(String(dateFrom));
      if (dateTo) filter.orderDate.$lte = new Date(String(dateTo));
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email phone')
        .populate('items.product', 'name price images thumbnail')
        .sort(String(sort))
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(filter),
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
  } catch (error) {
    next(error);
  }
};

// Get vendor-specific order summary/statistics
export const getVendorOrderSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendorId = (req as any).user?._id;
    if (!vendorId) {
      next(new appError('User not authenticated', 401));
      return;
    }

    // Get vendor product ids
    const vendorProductIds = await Product.find({ vendor: vendorId, isDeleted: false }).distinct('_id');

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
    const [totalOrders, pendingOrders, completedOrders] = await Promise.all([
      Order.countDocuments({ isDeleted: false, 'items.product': { $in: vendorProductIds } }),
      Order.countDocuments({ status: 'pending', isDeleted: false, 'items.product': { $in: vendorProductIds } }),
      Order.countDocuments({ status: 'delivered', isDeleted: false, 'items.product': { $in: vendorProductIds } }),
    ]);

    // Compute vendor-specific revenue and monthly stats using aggregation
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    const [totalRevenueAgg, monthlyAggDelivered, monthlyAggAll] = await Promise.all([
      Order.aggregate([
        { $match: { status: 'delivered', isDeleted: false, 'items.product': { $in: vendorProductIds } } },
        { $addFields: {
            vendorItems: {
              $filter: {
                input: '$items',
                as: 'it',
                cond: { $in: ['$$it.product', vendorProductIds] },
              }
            }
        }},
        { $group: { _id: null, total: { $sum: { $sum: '$vendorItems.subtotal' } } } },
      ]),
      Order.aggregate([
        { $match: { status: 'delivered', isDeleted: false, orderDate: { $gte: yearStart, $lte: yearEnd }, 'items.product': { $in: vendorProductIds } } },
        { $addFields: {
            vendorItems: {
              $filter: { input: '$items', as: 'it', cond: { $in: ['$$it.product', vendorProductIds] } }
            }
        }},
        { $group: { _id: { $month: '$orderDate' }, revenue: { $sum: { $sum: '$vendorItems.subtotal' } }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { isDeleted: false, orderDate: { $gte: yearStart, $lte: yearEnd }, 'items.product': { $in: vendorProductIds } } },
        { $group: { _id: { $month: '$orderDate' }, count: { $sum: 1 } } },
      ]),
    ]);

    const monthlyRevenue: number[] = Array(12).fill(0);
    const monthlyOrders: number[] = Array(12).fill(0);
    monthlyAggDelivered.forEach((row: any) => {
      const idx = (row._id as number) - 1;
      if (idx >= 0 && idx < 12) monthlyRevenue[idx] = row.revenue || 0;
    });
    monthlyAggAll.forEach((row: any) => {
      const idx = (row._id as number) - 1;
      if (idx >= 0 && idx < 12) monthlyOrders[idx] = row.count || 0;
    });

    const summary = {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenueAgg?.[0]?.total || 0,
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
  } catch (error) {
    next(error);
  }
};

// Get user's orders
export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const { page = 1, limit = 10, status, paymentStatus, dateFrom, dateTo, sort = '-orderDate' } = req.query;

    if (!userId) {
      next(new appError('User not authenticated', 401));
      return;
    }

    const filter: any = { user: userId, isDeleted: false };

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (dateFrom || dateTo) {
      filter.orderDate = {};
      if (dateFrom) filter.orderDate.$gte = new Date(dateFrom as string);
      if (dateTo) filter.orderDate.$lte = new Date(dateTo as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email phone')
        .populate('items.product', 'name price images thumbnail')
        .sort(sort as string)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(filter),
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
  } catch (error) {
    next(error);
  }
};

// Get all orders (admin only)
export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus, dateFrom, dateTo, sort = '-orderDate' } = req.query;

    const filter: any = { isDeleted: false };

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (dateFrom || dateTo) {
      filter.orderDate = {};
      if (dateFrom) filter.orderDate.$gte = new Date(dateFrom as string);
      if (dateTo) filter.orderDate.$lte = new Date(dateTo as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email phone')
        .populate('items.product', 'name price images thumbnail')
        .sort(sort as string)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(filter),
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
  } catch (error) {
    next(error);
  }
};

// Get single order by ID
export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?._id;
    const userRole = (req as any).user?.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new appError('Invalid order ID', 400));
      return;
    }

    const filter: any = { _id: id, isDeleted: false };
    
    // Non-admin users: allow customer to view their order,
    // and allow vendor to view if the order contains their products
    if (userRole !== 'admin') {
      if (userRole === 'user') {
        filter.user = userId;
      }
    }

    let order = await Order.findOne(filter)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images thumbnail')
      .lean();

    // If vendor and not found by above filter (because not the customer),
    // check if the order contains any of the vendor's products
    if (!order && userRole === 'vendor') {
      const vendorProductIds = await Product.find({ vendor: userId, isDeleted: false }).distinct('_id');
      order = await Order.findOne({ _id: id, isDeleted: false, 'items.product': { $in: vendorProductIds } })
        .populate('user', 'name email phone')
        .populate('items.product', 'name price images thumbnail')
        .lean();
    }

    if (!order) {
      next(new appError('Order not found', 404));
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Order retrieved successfully',
      data: order,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, note, trackingNumber, estimatedDelivery } = req.body;
    const adminId = (req as any).user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new appError('Invalid order ID', 400));
      return;
    }

    const order = await Order.findOne({ _id: id, isDeleted: false });

    if (!order) {
      next(new appError('Order not found', 404));
      return;
    }

    // Update order status using instance method
    await (order as any).updateStatus(status, note, adminId);

    // Update additional fields if provided
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);

    await order.save();

    // Get updated order with populated data
    const updatedOrder = await Order.findById(id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images thumbnail');

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Order status updated successfully',
      data: updatedOrder,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Cancel order
export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = (req as any).user?._id;
    const userRole = (req as any).user?.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new appError('Invalid order ID', 400));
      return;
    }

    const filter: any = { _id: id, isDeleted: false };
    
    // Non-admin users can only cancel their own orders
    if (userRole !== 'admin') {
      filter.user = userId;
    }

    const order = await Order.findOne(filter);

    if (!order) {
      next(new appError('Order not found', 404));
      return;
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled', 'returned'].includes(order.status)) {
      next(new appError(`Cannot cancel order with status: ${order.status}`, 400));
      return;
    }

    // Cancel order using instance method
    await (order as any).cancelOrder(reason, userId);

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    // Get updated order with populated data
    const updatedOrder = await Order.findById(id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images thumbnail');

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Order cancelled successfully',
      data: updatedOrder,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Return order
export const returnOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = (req as any).user?._id;
    const userRole = (req as any).user?.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new appError('Invalid order ID', 400));
      return;
    }

    const filter: any = { _id: id, isDeleted: false };
    
    // Non-admin users can only return their own orders
    if (userRole !== 'admin') {
      filter.user = userId;
    }

    const order = await Order.findOne(filter);

    if (!order) {
      next(new appError('Order not found', 404));
      return;
    }

    // Check if order can be returned
    if (order.status !== 'delivered') {
      next(new appError('Only delivered orders can be returned', 400));
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

    await order.save();

    // Get updated order with populated data
    const updatedOrder = await Order.findById(id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images thumbnail');

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Order returned successfully',
      data: updatedOrder,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Update payment status (admin only)
export const updatePaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { paymentStatus, transactionId, paymentDate } = req.body as any;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new appError('Invalid order ID', 400));
      return;
    }

    const order = await Order.findOne({ _id: id, isDeleted: false });

    if (!order) {
      next(new appError('Order not found', 404));
      return;
    }

    // Validate and map payment status
    const allowedStatuses = ['pending', 'paid', 'failed', 'refunded'] as const;
    if (!paymentStatus || !allowedStatuses.includes(paymentStatus)) {
      next(new appError('Invalid payment status', 400));
      return;
    }

    // Map UI 'paid' -> paymentInfo.status 'completed' (schema enum)
    const paymentInfoStatusMap: Record<string, 'pending' | 'completed' | 'failed' | 'refunded'> = {
      pending: 'pending',
      paid: 'completed',
      failed: 'failed',
      refunded: 'refunded',
    };

    order.paymentStatus = paymentStatus;
    order.paymentInfo.status = paymentInfoStatusMap[paymentStatus];

    if (transactionId) order.paymentInfo.transactionId = transactionId;
    if (paymentDate) order.paymentInfo.paymentDate = new Date(paymentDate);
    if (paymentStatus === 'paid' && !paymentDate) order.paymentInfo.paymentDate = new Date();

    await order.save();

    // Get updated order with populated data
    const updatedOrder = await Order.findById(id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images thumbnail');

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Payment status updated successfully',
      data: updatedOrder,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get order summary/statistics (admin only)
export const getOrderSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [totalOrders, pendingOrders, completedOrders, totalRevenue] = await Promise.all([
      Order.countDocuments({ isDeleted: false }),
      Order.countDocuments({ status: 'pending', isDeleted: false }),
      Order.countDocuments({ status: 'delivered', isDeleted: false }),
      Order.aggregate([
        { $match: { status: 'delivered', isDeleted: false } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
    ]);

    // Build monthly revenue and orders for the current year
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    // Delivered only: revenue + count (for monthlyRevenue)
    const monthlyAggDelivered = await Order.aggregate([
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
    const monthlyAggAll = await Order.aggregate([
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

    const monthlyRevenue: number[] = Array(12).fill(0);
    const monthlyOrders: number[] = Array(12).fill(0);
    monthlyAggDelivered.forEach((row: any) => {
      const idx = (row._id as number) - 1; // months are 1..12
      if (idx >= 0 && idx < 12) {
        monthlyRevenue[idx] = row.revenue || 0;
      }
    });
    monthlyAggAll.forEach((row: any) => {
      const idx = (row._id as number) - 1;
      if (idx >= 0 && idx < 12) {
        monthlyOrders[idx] = row.count || 0;
      }
    });

    const summary = {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
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
  } catch (error) {
    next(error);
  }
};
