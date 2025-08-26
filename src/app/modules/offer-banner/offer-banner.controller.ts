import { NextFunction, Request, Response } from 'express';
import { OfferBanner } from './offer-banner.model';
import { offerBannerValidation, updateOfferBannerValidation } from './offer-banner.validation';
import { appError } from '../../errors/appError';
import { cloudinary } from '../../config/cloudinary';

export const createOfferBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, subtitle, offer, url } = req.body;

    if (!req.file) {
      next(new appError('Offer banner image is required', 400));
      return;
    }

    const image = req.file.path;

    const validated = offerBannerValidation.parse({ title, subtitle, offer, url, image });

    const doc = new OfferBanner(validated);
    await doc.save();

    res.status(201).json({ success: true, statusCode: 201, message: 'Offer banner created successfully', data: doc });
  } catch (error) {
    if (req.file?.path) {
      const publicId = req.file.path.split('/').pop()?.split('.')[0];
      if (publicId) await cloudinary.uploader.destroy(`restaurant-offer-banners/${publicId}`);
    }
    next(error);
  }
};

export const getAllOfferBanners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await OfferBanner.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json({ success: true, statusCode: 200, message: 'Offer banners retrieved successfully', data: docs });
  } catch (error) {
    next(error);
  }
};

export const getOfferBannerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await OfferBanner.findOne({ _id: req.params.id, isDeleted: false });
    if (!doc) return next(new appError('Offer banner not found', 404));

    res.json({ success: true, statusCode: 200, message: 'Offer banner retrieved successfully', data: doc });
  } catch (error) {
    next(error);
  }
};

export const updateOfferBannerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, subtitle, offer, url } = req.body;

    const doc = await OfferBanner.findOne({ _id: id, isDeleted: false });
    if (!doc) return next(new appError('Offer banner not found', 404));

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (offer !== undefined) updateData.offer = offer;
    if (url !== undefined) updateData.url = url;

    if (req.file) {
      updateData.image = req.file.path;
      if (doc.image) {
        const publicId = doc.image.split('/').pop()?.split('.')[0];
        if (publicId) await cloudinary.uploader.destroy(`restaurant-offer-banners/${publicId}`);
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.json({ success: true, statusCode: 200, message: 'No changes to update', data: doc });
    }

    const validated = updateOfferBannerValidation.parse(updateData);
    const updated = await OfferBanner.findByIdAndUpdate(id, validated, { new: true });

    res.json({ success: true, statusCode: 200, message: 'Offer banner updated successfully', data: updated });
  } catch (error) {
    if (req.file?.path) {
      const publicId = req.file.path.split('/').pop()?.split('.')[0];
      if (publicId) await cloudinary.uploader.destroy(`restaurant-offer-banners/${publicId}`);
    }
    next(error);
  }
};

export const deleteOfferBannerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await OfferBanner.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!updated) return next(new appError('Offer banner not found', 404));

    res.json({ success: true, statusCode: 200, message: 'Offer banner deleted successfully', data: updated });
  } catch (error) {
    next(error);
  }
};
