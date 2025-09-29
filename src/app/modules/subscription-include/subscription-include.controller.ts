import { NextFunction, Request, Response } from 'express'
import { SubscriptionInclude } from './subscription-include.model'
import { includeValidation, includeUpdateValidation } from './subscription-include.validation'
import { appError } from '../../errors/appError'

export const createInclude = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raw = req.body || {}
    const parsed = includeValidation.parse({
      title: raw.title,
      order: typeof raw.order === 'string' ? parseInt(raw.order) : raw.order,
      isActive: raw.isActive === 'true' || raw.isActive === true,
    })
    const doc = await SubscriptionInclude.create(parsed as any)
    res.status(201).json({ success: true, statusCode: 201, message: 'Include created successfully', data: doc })
  } catch (err) {
    next(err)
  }
}

export const getIncludes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, page, limit, active } = req.query as any
    const filter: any = { isDeleted: false }
    if (active !== undefined) filter.isActive = active === 'true'
    if (search) {
      filter.$or = [
        { title: { $regex: String(search), $options: 'i' } },
      ]
    }

    const pageNum = Math.max(1, parseInt(page) || 1)
    const limitNum = Math.max(1, parseInt(limit) || 10)
    const skip = (pageNum - 1) * limitNum

    const [items, total] = await Promise.all([
      SubscriptionInclude.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limitNum),
      SubscriptionInclude.countDocuments(filter),
    ])

    res.json({
      success: true,
      statusCode: 200,
      message: 'Includes retrieved successfully',
      data: items,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    })
  } catch (err) {
    next(err)
  }
}

export const getIncludeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await SubscriptionInclude.findOne({ _id: req.params.id, isDeleted: false })
    if (!doc) return next(new appError('Include not found', 404))
    res.json({ success: true, statusCode: 200, message: 'Include retrieved', data: doc })
  } catch (err) {
    next(err)
  }
}

export const updateInclude = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raw = req.body || {}
    const payload = {
      title: raw.title,
      order: raw.order !== undefined ? (typeof raw.order === 'string' ? parseInt(raw.order) : raw.order) : undefined,
      isActive: raw.isActive !== undefined ? (raw.isActive === 'true' || raw.isActive === true) : undefined,
    }
    const parsed = includeUpdateValidation.parse(payload)

    const doc = await SubscriptionInclude.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      parsed,
      { new: true }
    )
    if (!doc) return next(new appError('Include not found', 404))

    res.json({ success: true, statusCode: 200, message: 'Include updated', data: doc })
  } catch (err) {
    next(err)
  }
}

export const deleteInclude = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await SubscriptionInclude.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    )
    if (!doc) return next(new appError('Include not found', 404))

    res.json({ success: true, statusCode: 200, message: 'Include deleted', data: doc })
  } catch (err) {
    next(err)
  }
}

export const toggleIncludeStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isActive } = req.body as { isActive?: boolean }
    const doc = await SubscriptionInclude.findOne({ _id: req.params.id, isDeleted: false })
    if (!doc) return next(new appError('Include not found', 404))

    if (typeof isActive === 'boolean') doc.isActive = isActive
    else doc.isActive = !doc.isActive

    await doc.save()

    res.json({ success: true, statusCode: 200, message: 'Include status updated', data: doc })
  } catch (err) {
    next(err)
  }
}
