import { NextFunction, Request, Response } from 'express';
import { Payment } from './payment.model';
import { Order } from '../order/order.model';
import mongoose from 'mongoose';
import { appError } from '../../errors/appError';
import crypto from 'crypto';

// Razorpay configuration (you'll need to install razorpay package)
// npm install razorpay @types/razorpay
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'your_razorpay_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret',
});

// Create payment order (Razorpay order creation)
export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const { orderId, amount, currency = 'INR', method, description, notes, customerEmail, customerPhone } = req.body;

    if (!userId) {
      next(new appError('User not authenticated', 401));
      return;
    }

    // Validate order exists and belongs to user
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      next(new appError('Invalid order ID', 400));
      return;
    }

    const order = await Order.findOne({ 
      _id: orderId, 
      user: userId, 
      isDeleted: false 
    });

    if (!order) {
      next(new appError('Order not found', 404));
      return;
    }

    // Check if payment already exists for this order
    const existingPayment = await Payment.findOne({ 
      orderId, 
      status: { $in: ['pending', 'processing', 'completed'] },
      isDeleted: false 
    });

    if (existingPayment) {
      next(new appError('Payment already exists for this order', 400));
      return;
    }

    // Get user details from request or order
    const email = customerEmail || (req as any).user?.email || order.shippingAddress.email;
    const phone = customerPhone || (req as any).user?.phone || order.shippingAddress.phone;

    let razorpayOrder = null;
    let razorpayOrderId = null;

    // Create Razorpay order for online payments
    if (method !== 'cash_on_delivery') {
      try {
        const razorpayOptions = {
          amount: amount * 100, // Razorpay expects amount in paisa
          currency: currency.toUpperCase(),
          receipt: `order_${orderId}_${Date.now()}`,
          notes: {
            orderId: orderId,
            userId: userId.toString(),
            ...notes,
          },
        };

        razorpayOrder = await razorpay.orders.create(razorpayOptions);
        razorpayOrderId = razorpayOrder.id;
      } catch (error: any) {
        console.error('Razorpay order creation failed:', error);
        next(new appError('Failed to create payment order', 500));
        return;
      }
    }

    // Create payment record
    const payment = new Payment({
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

    await payment.save();

    // Update order payment status if COD
    if (method === 'cash_on_delivery') {
      order.paymentStatus = 'pending';
      order.paymentInfo.method = 'cash_on_delivery';
      order.paymentInfo.status = 'pending';
      await order.save();
    }

    const response: any = {
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
  } catch (error) {
    next(error);
  }
};

// Verify Razorpay payment
export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Find payment by Razorpay order ID
    const payment = await Payment.findOne({ 
      razorpayOrderId: razorpay_order_id,
      isDeleted: false 
    }).populate('orderId');

    if (!payment) {
      next(new appError('Payment not found', 404));
      return;
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Mark payment as failed
      await payment.markFailed('Invalid signature', 'SIGNATURE_MISMATCH', 'Payment signature verification failed');
      
      next(new appError('Payment verification failed', 400));
      return;
    }

    // Fetch payment details from Razorpay
    try {
      const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);
      
      // Update payment record
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.status = razorpayPayment.status === 'captured' ? 'completed' : 'processing';
      payment.gatewayResponse = razorpayPayment;
      
      if (payment.status === 'completed') {
        payment.completedAt = new Date();
      }

      await payment.save();

      // Update order payment status
      const order = payment.orderId as any;
      if (order) {
        order.paymentStatus = payment.status === 'completed' ? 'paid' : 'pending';
        order.paymentInfo.status = payment.status === 'completed' ? 'completed' : 'pending';
        order.paymentInfo.transactionId = razorpay_payment_id;
        order.paymentInfo.paymentDate = payment.completedAt;
        await order.save();
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
    } catch (error: any) {
      console.error('Razorpay payment fetch failed:', error);
      await payment.markFailed('Payment fetch failed', 'FETCH_ERROR', error.message);
      next(new appError('Payment verification failed', 500));
      return;
    }
  } catch (error) {
    next(error);
  }
};

// Get user payments
export const getUserPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const { page = 1, limit = 10, status, method, orderId, dateFrom, dateTo, sort = '-initiatedAt' } = req.query;

    if (!userId) {
      next(new appError('User not authenticated', 401));
      return;
    }

    const filter: any = { userId, isDeleted: false };

    if (status) filter.status = status;
    if (method) filter.method = method;
    if (orderId) filter.orderId = orderId;

    if (dateFrom || dateTo) {
      filter.initiatedAt = {};
      if (dateFrom) filter.initiatedAt.$gte = new Date(dateFrom as string);
      if (dateTo) filter.initiatedAt.$lte = new Date(dateTo as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('orderId', 'orderNumber totalAmount status')
        .populate('userId', 'name email phone')
        .sort(sort as string)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Payment.countDocuments(filter),
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
  } catch (error) {
    next(error);
  }
};

// Get all payments (admin only)
export const getAllPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10, status, method, orderId, dateFrom, dateTo, sort = '-initiatedAt' } = req.query;

    const filter: any = { isDeleted: false };

    if (status) filter.status = status;
    if (method) filter.method = method;
    if (orderId) filter.orderId = orderId;

    if (dateFrom || dateTo) {
      filter.initiatedAt = {};
      if (dateFrom) filter.initiatedAt.$gte = new Date(dateFrom as string);
      if (dateTo) filter.initiatedAt.$lte = new Date(dateTo as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('orderId', 'orderNumber totalAmount status')
        .populate('userId', 'name email phone')
        .sort(sort as string)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Payment.countDocuments(filter),
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
  } catch (error) {
    next(error);
  }
};

// Get single payment by ID
export const getPaymentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?._id;
    const userRole = (req as any).user?.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new appError('Invalid payment ID', 400));
      return;
    }

    const filter: any = { _id: id, isDeleted: false };
    
    // Non-admin users can only view their own payments
    if (userRole !== 'admin') {
      filter.userId = userId;
    }

    const payment = await Payment.findOne(filter)
      .populate('orderId', 'orderNumber totalAmount status')
      .populate('userId', 'name email phone')
      .lean();

    if (!payment) {
      next(new appError('Payment not found', 404));
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Payment retrieved successfully',
      data: payment,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Refund payment (admin only)
export const refundPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { amount, reason, notes } = req.body;
    const adminId = (req as any).user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new appError('Invalid payment ID', 400));
      return;
    }

    const payment = await Payment.findOne({ _id: id, isDeleted: false });

    if (!payment) {
      next(new appError('Payment not found', 404));
      return;
    }

    if (payment.status !== 'completed') {
      next(new appError('Only completed payments can be refunded', 400));
      return;
    }

    const refundAmount = amount || (payment.amount - payment.amountRefunded);

    if (refundAmount <= 0 || refundAmount > (payment.amount - payment.amountRefunded)) {
      next(new appError('Invalid refund amount', 400));
      return;
    }

    try {
      // Create refund in Razorpay
      let razorpayRefund = null;
      if (payment.razorpayPaymentId) {
        razorpayRefund = await razorpay.payments.refund(payment.razorpayPaymentId, {
          amount: refundAmount,
          notes: notes || {},
        });
      }

      // Add refund to payment record
      await payment.addRefund({
        refundId: razorpayRefund?.id || `REF-${Date.now()}`,
        amount: refundAmount,
        reason,
        status: razorpayRefund ? 'processed' : 'pending',
        processedAt: razorpayRefund ? new Date() : undefined,
        refundedBy: adminId,
      });

      // Get updated payment
      const updatedPayment = await Payment.findById(id)
        .populate('orderId', 'orderNumber totalAmount status')
        .populate('userId', 'name email phone');

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Refund processed successfully',
        data: updatedPayment,
      });
      return;
    } catch (error: any) {
      console.error('Refund processing failed:', error);
      next(new appError('Refund processing failed', 500));
      return;
    }
  } catch (error) {
    next(error);
  }
};

// Webhook handler for Razorpay
export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const webhookSignature = req.get('X-Razorpay-Signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSignature || !webhookSecret) {
      next(new appError('Invalid webhook request', 400));
      return;
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== webhookSignature) {
      next(new appError('Invalid webhook signature', 400));
      return;
    }

    const { event, payload } = req.body;

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(payload.payment.entity);
        break;
      case 'refund.processed':
        await handleRefundProcessed(payload.refund.entity);
        break;
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    res.status(200).json({ success: true });
    return;
  } catch (error) {
    console.error('Webhook processing failed:', error);
    next(error);
  }
};

// Helper function to handle payment captured webhook
const handlePaymentCaptured = async (paymentData: any) => {
  const payment = await Payment.findOne({ 
    razorpayPaymentId: paymentData.id,
    isDeleted: false 
  });

  if (payment) {
    await payment.markCompleted(paymentData);
    
    // Update order status
    const order = await Order.findById(payment.orderId);
    if (order) {
      order.paymentStatus = 'paid';
      order.paymentInfo.status = 'completed';
      order.paymentInfo.transactionId = paymentData.id;
      order.paymentInfo.paymentDate = new Date();
      await order.save();
    }
  }
};

// Helper function to handle payment failed webhook
const handlePaymentFailed = async (paymentData: any) => {
  const payment = await Payment.findOne({ 
    razorpayPaymentId: paymentData.id,
    isDeleted: false 
  });

  if (payment) {
    await payment.markFailed(
      paymentData.error_description || 'Payment failed',
      paymentData.error_code,
      paymentData.error_description
    );
  }
};

// Helper function to handle refund processed webhook
const handleRefundProcessed = async (refundData: any) => {
  const payment = await Payment.findOne({ 
    razorpayPaymentId: refundData.payment_id,
    isDeleted: false 
  });

  if (payment) {
    // Update refund status in payment record
    const refund = payment.refunds.find(r => r.refundId === refundData.id);
    if (refund) {
      refund.status = 'processed';
      refund.processedAt = new Date();
      await payment.save();
    }
  }
};

// Get payment summary (admin only)
export const getPaymentSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { dateFrom, dateTo, userId } = req.query;

    const filter: any = { isDeleted: false };

    if (userId) filter.userId = userId;

    if (dateFrom || dateTo) {
      filter.initiatedAt = {};
      if (dateFrom) filter.initiatedAt.$gte = new Date(dateFrom as string);
      if (dateTo) filter.initiatedAt.$lte = new Date(dateTo as string);
    }

    const [
      totalPayments,
      totalAmount,
      successfulPayments,
      failedPayments,
      pendingPayments,
      totalRefunded,
      methodBreakdown
    ] = await Promise.all([
      Payment.countDocuments(filter),
      Payment.aggregate([
        { $match: { ...filter, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.countDocuments({ ...filter, status: 'completed' }),
      Payment.countDocuments({ ...filter, status: 'failed' }),
      Payment.countDocuments({ ...filter, status: 'pending' }),
      Payment.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$amountRefunded' } } }
      ]),
      Payment.aggregate([
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
      totalAmount: totalAmount[0]?.total || 0,
      successfulPayments,
      failedPayments,
      pendingPayments,
      totalRefunded: totalRefunded[0]?.total || 0,
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
  } catch (error) {
    next(error);
  }
};
