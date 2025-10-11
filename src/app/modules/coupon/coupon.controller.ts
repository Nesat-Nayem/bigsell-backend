import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Coupon } from './coupon.model';
import { Product } from '../product/product.model';
import { appError } from '../../errors/appError';

const normalizeCode = (c?: string) => (c || '').trim().toUpperCase();

function isActiveWindow(c: any) {
  const now = new Date();
  return (
    c.status === 'active' &&
    new Date(c.startDate) <= now &&
    new Date(c.endDate) >= now &&
    c.isDeleted === false
  );
}

async function computeEligibleSubtotal(items: Array<{ productId: string; quantity: number }>, targetVendor?: string | null) {
  const productIds = items.map((i) => i.productId).filter(Boolean);
  const products = await Product.find({ _id: { $in: productIds }, isDeleted: false }).select('price vendor');
  const priceMap = new Map<string, { price: number; vendor?: string | null }>();
  products.forEach((p: any) => priceMap.set(String(p._id), { price: p.price || 0, vendor: p.vendor ? String(p.vendor) : null }));

  let eligible = 0;
  let all = 0;
  for (const it of items) {
    const meta = priceMap.get(String(it.productId));
    if (!meta) continue;
    const sub = (meta.price || 0) * Math.max(1, Number(it.quantity) || 1);
    all += sub;
    if (!targetVendor || (meta.vendor && String(meta.vendor) === String(targetVendor))) {
      eligible += sub;
    }
  }
  return { eligible, subtotal: all };
}

function computeDiscountAmount(coupon: any, eligibleSubtotal: number) {
  let amount = 0;
  if (coupon.discountType === 'percentage') {
    amount = (eligibleSubtotal * Number(coupon.discountValue || 0)) / 100;
    if (coupon.maxDiscountAmount != null) {
      amount = Math.min(amount, Number(coupon.maxDiscountAmount));
    }
  } else {
    amount = Math.min(Number(coupon.discountValue || 0), eligibleSubtotal);
  }
  if (coupon.minOrderAmount != null && eligibleSubtotal < Number(coupon.minOrderAmount)) {
    return 0;
  }
  amount = Math.max(0, amount);
  return amount;
}

export const createCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actor = (req as any).user;
    if (!actor?._id) return next(new appError('User not authenticated', 401));
    const isAdmin = String(actor.role) === 'admin';
    const isVendor = String(actor.role) === 'vendor';
    if (!isAdmin && !isVendor) return next(new appError('Forbidden', 403));

    const body = req.body as any;
    const payload: any = {
      code: normalizeCode(body.code),
      discountType: body.discountType || 'percentage',
      discountValue: Number(body.discountValue),
      maxDiscountAmount: body.maxDiscountAmount != null ? Number(body.maxDiscountAmount) : undefined,
      minOrderAmount: body.minOrderAmount != null ? Number(body.minOrderAmount) : undefined,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      status: body.status === 'inactive' ? 'inactive' : 'active',
      vendor: isVendor ? actor._id : (body.vendor && isAdmin ? body.vendor : null),
      createdBy: actor._id,
    };

    const exists = await Coupon.findOne({ code: payload.code, isDeleted: false });
    if (exists) {
      return next(new appError('Coupon code already exists', 400));
    }

    const c = await Coupon.create(payload);
    res.status(201).json({ success: true, statusCode: 201, message: 'Coupon created', data: c });
  } catch (e) {
    next(e);
  }
};

export const listCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actor = (req as any).user;
    if (!actor?._id) return next(new appError('User not authenticated', 401));
    const isAdmin = String(actor.role) === 'admin';
    const isVendor = String(actor.role) === 'vendor';
    if (!isAdmin && !isVendor) return next(new appError('Forbidden', 403));

    const filter: any = { isDeleted: false };
    if (isVendor) filter.vendor = actor._id; // vendor sees only own coupons

    const items = await Coupon.find(filter).sort('-createdAt');
    res.status(200).json({ success: true, statusCode: 200, message: 'Coupons retrieved', data: items });
  } catch (e) {
    next(e);
  }
};

export const getCouponById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actor = (req as any).user;
    if (!actor?._id) return next(new appError('User not authenticated', 401));
    const isAdmin = String(actor.role) === 'admin';
    const isVendor = String(actor.role) === 'vendor';
    if (!isAdmin && !isVendor) return next(new appError('Forbidden', 403));

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return next(new appError('Invalid coupon ID', 400));

    const c: any = await Coupon.findOne({ _id: id, isDeleted: false });
    if (!c) return next(new appError('Coupon not found', 404));

    if (isVendor && c.vendor && String(c.vendor) !== String(actor._id)) {
      return next(new appError('Forbidden', 403));
    }

    res.status(200).json({ success: true, statusCode: 200, message: 'Coupon retrieved', data: c });
  } catch (e) {
    next(e);
  }
};

export const updateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actor = (req as any).user;
    if (!actor?._id) return next(new appError('User not authenticated', 401));
    const isAdmin = String(actor.role) === 'admin';
    const isVendor = String(actor.role) === 'vendor';
    if (!isAdmin && !isVendor) return next(new appError('Forbidden', 403));

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return next(new appError('Invalid coupon ID', 400));

    const existing: any = await Coupon.findOne({ _id: id, isDeleted: false });
    if (!existing) return next(new appError('Coupon not found', 404));

    if (isVendor && existing.vendor && String(existing.vendor) !== String(actor._id)) {
      return next(new appError('Forbidden', 403));
    }

    const body = req.body as any;
    if (body.code) existing.code = normalizeCode(body.code);
    if (body.discountType) existing.discountType = body.discountType;
    if (body.discountValue != null) existing.discountValue = Number(body.discountValue);
    if (body.maxDiscountAmount != null) existing.maxDiscountAmount = Number(body.maxDiscountAmount);
    if (body.minOrderAmount != null) existing.minOrderAmount = Number(body.minOrderAmount);
    if (body.startDate) existing.startDate = new Date(body.startDate);
    if (body.endDate) existing.endDate = new Date(body.endDate);
    if (body.status) existing.status = body.status === 'inactive' ? 'inactive' : 'active';

    await existing.save();
    res.status(200).json({ success: true, statusCode: 200, message: 'Coupon updated', data: existing });
  } catch (e) {
    next(e);
  }
};

export const deleteCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actor = (req as any).user;
    if (!actor?._id) return next(new appError('User not authenticated', 401));
    const isAdmin = String(actor.role) === 'admin';
    const isVendor = String(actor.role) === 'vendor';
    if (!isAdmin && !isVendor) return next(new appError('Forbidden', 403));

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return next(new appError('Invalid coupon ID', 400));

    const existing: any = await Coupon.findOne({ _id: id, isDeleted: false });
    if (!existing) return next(new appError('Coupon not found', 404));

    if (isVendor && existing.vendor && String(existing.vendor) !== String(actor._id)) {
      return next(new appError('Forbidden', 403));
    }

    existing.isDeleted = true;
    await existing.save();
    res.status(200).json({ success: true, statusCode: 200, message: 'Coupon deleted', data: existing });
  } catch (e) {
    next(e);
  }
};

export const applyCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, items } = req.body as { code?: string; items?: Array<{ productId: string; quantity: number }> };
    const normalized = normalizeCode(code);
    if (!normalized) return next(new appError('Coupon code required', 400));
    if (!Array.isArray(items) || items.length === 0) return next(new appError('Items required', 400));

    const c: any = await Coupon.findOne({ code: normalized, isDeleted: false });
    if (!c || !isActiveWindow(c)) {
      return res.status(200).json({ success: true, statusCode: 200, message: 'Invalid or expired coupon', data: { valid: false, discountAmount: 0 } });
    }

    const { eligible, subtotal } = await computeEligibleSubtotal(items, c.vendor ? String(c.vendor) : null);
    const discountAmount = computeDiscountAmount(c, eligible);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: discountAmount > 0 ? 'Coupon applied' : 'Coupon not applicable',
      data: {
        valid: discountAmount > 0,
        discountAmount,
        code: c.code,
        discountType: c.discountType,
        eligibleSubtotal: eligible,
        subtotal,
      },
    });
  } catch (e) {
    next(e);
  }
};
