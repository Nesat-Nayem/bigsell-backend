import { NextFunction, Request, Response } from "express";
import { cloudinary } from "../../config/cloudinary";
import { appError } from "../../errors/appError";
import { v2 as cloudinaryV2 } from 'cloudinary';

// Upload a single image
export const uploadSingleImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      next(new appError("No image file provided", 400));
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Image uploaded successfully",
      data: {
        url: req.file.path,
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    // If error during image upload, delete the uploaded image if any
    if (req.file?.path) {
      const publicId = req.file.path.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`restaurant-uploads/${publicId}`);
      }
    }
    next(error);
  }
};

// Upload multiple images
export const uploadMultipleImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      next(new appError("No image files provided", 400));
      return;
    }

    const uploadedFiles = (req.files as Express.Multer.File[]).map(file => ({
      url: file.path,
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    }));

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Images uploaded successfully",
      data: uploadedFiles
    });
  } catch (error) {
    // If error during image upload, delete the uploaded images if any
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        if (file.path) {
          const publicId = file.path.split('/').pop()?.split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`restaurant-uploads/${publicId}`);
          }
        }
      }
    }
    next(error);
  }
};

export const uploadKYCDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return next(new appError('No file uploaded', 400));
    }

    // File has already been uploaded to Cloudinary by multer middleware
    const fileUrl = (req.file as any).path || (req.file as any).secure_url;

    res.json({
      success: true,
      statusCode: 200,
      message: 'File uploaded successfully',
      data: {
        url: fileUrl,
        publicId: (req.file as any).public_id
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUploadedFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return next(new appError('Public ID is required', 400));
    }

    const result = await cloudinaryV2.uploader.destroy(publicId);

    res.json({
      success: true,
      statusCode: 200,
      message: 'File deleted successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};