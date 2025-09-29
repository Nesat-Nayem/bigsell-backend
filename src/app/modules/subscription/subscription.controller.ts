import { NextFunction, Request, Response } from 'express';
import { Subscription } from './subscription.model';
import { SubscriptionInclude } from '../subscription-include/subscription-include.model';
import { subscriptionValidation, subscriptionUpdateValidation } from './subscription.validation';
import { appError } from '../../errors/appError';

export const createSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raw = req.body || {};

    // Normalize types
    const parsed = subscriptionValidation.parse({
      name: raw.name,
      price: typeof raw.price === 'string' ? parseFloat(raw.price) : raw.price,
      currency: raw.currency,
      billingCycle: raw.billingCycle,
      color: raw.color,
      features: Array.isArray(raw.features)
        ? raw.features
        : typeof raw.features === 'string'
        ? raw.features.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      includeIds: Array.isArray(raw.includeIds)
        ? raw.includeIds.map((id: any) => String(id))
        : typeof raw.includeIds === 'string'
        ? String(raw.includeIds).split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      order: typeof raw.order === 'string' ? parseInt(raw.order) : raw.order,
      isActive: raw.isActive === 'true' || raw.isActive === true,
      metaTitle: raw.metaTitle,
      metaTags: Array.isArray(raw.metaTags)
        ? raw.metaTags
        : typeof raw.metaTags === 'string'
        ? raw.metaTags.split(',').map((s: string) => s.trim()).filter(Boolean)
        : undefined,
      metaDescription: raw.metaDescription,
    });

    // Derive features from includeIds (active, non-deleted)
    let derivedFeatures: string[] = [];
    if (parsed.includeIds && parsed.includeIds.length > 0) {
      const includes = await SubscriptionInclude.find({
        _id: { $in: parsed.includeIds },
        isDeleted: false,
        isActive: true,
      });
      derivedFeatures = includes.map((i) => i.title);
    }

    const doc = new Subscription({
      ...parsed,
      features: Array.from(new Set([...(parsed.features || []), ...derivedFeatures])),
    } as any);
    await doc.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Subscription created successfully',
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { active, limit, page, search } = req.query as { active?: string; limit?: string; page?: string; search?: string };
    const filter: any = { isDeleted: false };
    if (active === 'true') filter.isActive = true;
    if (active === 'false') filter.isActive = false;
    if (search) {
      const s = String(search);
      filter.$or = [
        { name: { $regex: s, $options: 'i' } },
        { slug: { $regex: s, $options: 'i' } },
        { metaTitle: { $regex: s, $options: 'i' } },
      ];
    }

    const sort = { order: 1, createdAt: -1 } as const;
    const limitNum = limit ? parseInt(limit) : undefined;
    const pageNum = page ? parseInt(page) : undefined;

    // If pagination requested
    if (pageNum && limitNum) {
      const skip = (Math.max(1, pageNum) - 1) * Math.max(1, limitNum);
      const [items, total] = await Promise.all([
        Subscription.find(filter).sort(sort).skip(skip).limit(limitNum),
        Subscription.countDocuments(filter),
      ]);

      return res.json({
        success: true,
        statusCode: 200,
        message: 'Subscriptions retrieved successfully',
        data: items,
        meta: {
          total,
          page: Math.max(1, pageNum),
          limit: Math.max(1, limitNum),
          totalPages: Math.ceil(total / Math.max(1, limitNum)) || 1,
        },
      });
    }

    // Non-paginated with optional limit (keeps vendor endpoint behavior)
    const q = Subscription.find(filter).sort(sort);
    if (limitNum && limitNum > 0) q.limit(limitNum);
    const items = await q.exec();
    return res.json({
      success: true,
      statusCode: 200,
      message: 'Subscriptions retrieved successfully',
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, isDeleted: false });
    if (!sub) return next(new appError('Subscription not found', 404));

    res.json({
      success: true,
      statusCode: 200,
      message: 'Subscription retrieved successfully',
      data: sub,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubscriptionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, isDeleted: false });
    if (!sub) return next(new appError('Subscription not found', 404));

    const raw = req.body || {};
    const payload = {
      name: raw.name,
      price: raw.price !== undefined ? (typeof raw.price === 'string' ? parseFloat(raw.price) : raw.price) : undefined,
      currency: raw.currency,
      billingCycle: raw.billingCycle,
      color: raw.color,
      features: Array.isArray(raw.features)
        ? raw.features
        : typeof raw.features === 'string'
        ? raw.features.split(',').map((s: string) => s.trim()).filter(Boolean)
        : undefined,
      includeIds: Array.isArray(raw.includeIds)
        ? raw.includeIds.map((id: any) => String(id))
        : typeof raw.includeIds === 'string'
        ? String(raw.includeIds).split(',').map((s: string) => s.trim()).filter(Boolean)
        : undefined,
      order: raw.order !== undefined ? (typeof raw.order === 'string' ? parseInt(raw.order) : raw.order) : undefined,
      isActive: raw.isActive !== undefined ? (raw.isActive === 'true' || raw.isActive === true) : undefined,
      metaTitle: raw.metaTitle,
      metaTags: Array.isArray(raw.metaTags)
        ? raw.metaTags
        : typeof raw.metaTags === 'string'
        ? raw.metaTags.split(',').map((s: string) => s.trim()).filter(Boolean)
        : undefined,
      metaDescription: raw.metaDescription,
    } as any;

    const validated = subscriptionUpdateValidation.parse(payload);

    // Merge derived features from includeIds if provided
    let derivedFeatures: string[] | undefined;
    if (validated.includeIds && Array.isArray(validated.includeIds)) {
      const includes = await SubscriptionInclude.find({
        _id: { $in: validated.includeIds },
        isDeleted: false,
        isActive: true,
      });
      derivedFeatures = includes.map((i) => i.title);
    }

    // Apply updates and save (to trigger pre-save hook for max-3-active rule)
    Object.assign(sub, validated);
    if (derivedFeatures) {
      const curr = Array.isArray(sub.features) ? sub.features : [];
      sub.features = Array.from(new Set([...(validated.features ?? curr), ...derivedFeatures]));
    }
    await sub.save();

    res.json({
      success: true,
      statusCode: 200,
      message: 'Subscription updated successfully',
      data: sub,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubscriptionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sub = await Subscription.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!sub) return next(new appError('Subscription not found', 404));

    res.json({
      success: true,
      statusCode: 200,
      message: 'Subscription deleted successfully',
      data: sub,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleSubscriptionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, isDeleted: false });
    if (!sub) return next(new appError('Subscription not found', 404));

    const body = (req.body || {}) as { isActive?: boolean };
    if (typeof body.isActive === 'boolean') sub.isActive = body.isActive;
    else sub.isActive = !sub.isActive;

    await sub.save();

    res.json({
      success: true,
      statusCode: 200,
      message: 'Subscription status updated',
      data: sub,
    });
  } catch (error) {
    next(error);
  }
};
