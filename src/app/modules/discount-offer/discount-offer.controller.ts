import { NextFunction, Request, Response } from 'express';
import { DiscountOffer } from './discount-offer.model';
import { discountOfferValidation, updateDiscountOfferValidation } from './discount-offer.validation';
import { appError } from '../../errors/appError';
import { cloudinary } from '../../config/cloudinary';

export const createDiscountOffer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, offer } = req.body;

    if (!req.file) {
      next(new appError('Offer image is required', 400));
      return;
    }

    const image = req.file.path;

    const validated = discountOfferValidation.parse({ title, offer, image });

    const doc = new DiscountOffer(validated);
    await doc.save();

    res.status(201).json({ success: true, statusCode: 201, message: 'Discount offer created successfully', data: doc });
  } catch (error) {
    if (req.file?.path) {
      const publicId = req.file.path.split('/').pop()?.split('.')[0];
      if (publicId) await cloudinary.uploader.destroy(`restaurant-discount-offers/${publicId}`);
    }
    next(error);
  }
};

export const getAllDiscountOffers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await DiscountOffer.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json({ success: true, statusCode: 200, message: 'Discount offers retrieved successfully', data: docs });
  } catch (error) {
    next(error);
  }
};

export const getDiscountOfferById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await DiscountOffer.findOne({ _id: req.params.id, isDeleted: false });
    if (!doc) return next(new appError('Discount offer not found', 404));

    res.json({ success: true, statusCode: 200, message: 'Discount offer retrieved successfully', data: doc });
  } catch (error) {
    next(error);
  }
};

export const updateDiscountOfferById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, offer } = req.body;

    const doc = await DiscountOffer.findOne({ _id: id, isDeleted: false });
    if (!doc) return next(new appError('Discount offer not found', 404));

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (offer !== undefined) updateData.offer = offer;

    if (req.file) {
      updateData.image = req.file.path;
      if (doc.image) {
        const publicId = doc.image.split('/').pop()?.split('.')[0];
        if (publicId) await cloudinary.uploader.destroy(`restaurant-discount-offers/${publicId}`);
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.json({ success: true, statusCode: 200, message: 'No changes to update', data: doc });
    }

    const validated = updateDiscountOfferValidation.parse(updateData);
    const updated = await DiscountOffer.findByIdAndUpdate(id, validated, { new: true });

    res.json({ success: true, statusCode: 200, message: 'Discount offer updated successfully', data: updated });
  } catch (error) {
    if (req.file?.path) {
      const publicId = req.file.path.split('/').pop()?.split('.')[0];
      if (publicId) await cloudinary.uploader.destroy(`restaurant-discount-offers/${publicId}`);
    }
    next(error);
  }
};

export const deleteDiscountOfferById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await DiscountOffer.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!updated) return next(new appError('Discount offer not found', 404));

    res.json({ success: true, statusCode: 200, message: 'Discount offer deleted successfully', data: updated });
  } catch (error) {
    next(error);
  }
};
