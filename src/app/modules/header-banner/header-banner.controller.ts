import { NextFunction, Request, Response } from 'express';
import { HeaderBanner } from './header-banner.model';
import { headerBannerValidation, headerBannerUpdateValidation } from './header-banner.validation';
import { appError } from '../../errors/appError';
import { cloudinary } from '../../config/cloudinary';

export const createHeaderBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, isActive, order } = req.body;

    if (!req.file) {
      next(new appError('Header banner image is required', 400));
      return;
    }

    const image = req.file.path;

    const validated = headerBannerValidation.parse({
      title,
      image,
      isActive: isActive === 'true' || isActive === true,
      order: order ? parseInt(order as string) : undefined,
    });

    const doc = new HeaderBanner(validated);
    await doc.save();

    res.status(201).json({ success: true, statusCode: 201, message: 'Header banner created successfully', data: doc });
  } catch (error) {
    if (req.file?.path) {
      const publicId = req.file.path.split('/').pop()?.split('.')[0];
      if (publicId) await cloudinary.uploader.destroy(`restaurant-header-banners/${publicId}`);
    }
    next(error);
  }
};

export const getAllHeaderBanners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { active } = req.query;
    const filter: any = { isDeleted: false };
    if (active === 'true') filter.isActive = true;

    const docs = await HeaderBanner.find(filter).sort({ order: 1, createdAt: -1 });

    res.json({ success: true, statusCode: 200, message: 'Header banners retrieved successfully', data: docs });
  } catch (error) {
    next(error);
  }
};

export const getHeaderBannerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await HeaderBanner.findOne({ _id: req.params.id, isDeleted: false });
    if (!doc) return next(new appError('Header banner not found', 404));

    res.json({ success: true, statusCode: 200, message: 'Header banner retrieved successfully', data: doc });
  } catch (error) {
    next(error);
  }
};

export const updateHeaderBannerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, isActive, order } = req.body;

    const doc = await HeaderBanner.findOne({ _id: id, isDeleted: false });
    if (!doc) return next(new appError('Header banner not found', 404));

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
    if (order !== undefined) updateData.order = parseInt(order as string);

    if (req.file) {
      updateData.image = req.file.path;
      if (doc.image) {
        const publicId = doc.image.split('/').pop()?.split('.')[0];
        if (publicId) await cloudinary.uploader.destroy(`restaurant-header-banners/${publicId}`);
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.json({ success: true, statusCode: 200, message: 'No changes to update', data: doc });
    }

    const validated = headerBannerUpdateValidation.parse(updateData);
    const updated = await HeaderBanner.findByIdAndUpdate(id, validated, { new: true });

    res.json({ success: true, statusCode: 200, message: 'Header banner updated successfully', data: updated });
  } catch (error) {
    if (req.file?.path) {
      const publicId = req.file.path.split('/').pop()?.split('.')[0];
      if (publicId) await cloudinary.uploader.destroy(`restaurant-header-banners/${publicId}`);
    }
    next(error);
  }
};

export const deleteHeaderBannerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await HeaderBanner.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!updated) return next(new appError('Header banner not found', 404));

    res.json({ success: true, statusCode: 200, message: 'Header banner deleted successfully', data: updated });
  } catch (error) {
    next(error);
  }
};
