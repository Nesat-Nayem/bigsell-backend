import { NextFunction, Request, Response } from "express";
import { FeatureOffer } from "./feature-offer.model";
import { featureOfferValidation, featureOfferUpdateValidation } from "./feature-offer.validation";
import { appError } from "../../errors/appError";
import { cloudinary } from "../../config/cloudinary";

export const createFeatureOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, subtitle, description, url, isActive, order } = req.body;
    
    // If image is uploaded through multer middleware, req.file will be available
    if (!req.file) {
       next(new appError("Feature offer image is required", 400));
       return;
    }

    // Get the image URL from req.file
    const image = req.file.path;
    
    // Validate the input
    const validatedData = featureOfferValidation.parse({ 
      title, 
      subtitle,
      description,
      image,
      url,
      isActive: isActive === 'true' || isActive === true,
      order: order ? parseInt(order as string) : undefined
    });

    // Create a new feature offer
    const featureOffer = new FeatureOffer(validatedData);
    await featureOffer.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Feature offer created successfully",
      data: featureOffer,
    });
    return;
  } catch (error) {
    // If error is during image upload, delete the uploaded image if any
    if (req.file?.path) {
      const publicId = req.file.path.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`restaurant-features/${publicId}`);
      }
    }
    next(error);
  }
};

export const getAllFeatureOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get only active feature offers if requested
    const { active } = req.query;
    const filter: any = { isDeleted: false };
    
    if (active === 'true') {
      filter.isActive = true;
    }
    
    const featureOffers = await FeatureOffer.find(filter).sort({ order: 1, createdAt: -1 });
    
    if (featureOffers.length === 0) {
       res.json({
        success: true,
        statusCode: 200,
        message: "No feature offers found",
        data: [],
      });
      return
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Feature offers retrieved successfully",
      data: featureOffers,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getFeatureOfferById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const featureOffer = await FeatureOffer.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });
    
    if (!featureOffer) {
      return next(new appError("Feature offer not found", 404));
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Feature offer retrieved successfully",
      data: featureOffer,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateFeatureOfferById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const featureOfferId = req.params.id;
    const { title, subtitle, description, url, isActive, order } = req.body;
    
    // Find the feature offer to update
    const featureOffer = await FeatureOffer.findOne({ 
      _id: featureOfferId, 
      isDeleted: false 
    });
    
    if (!featureOffer) {
       next(new appError("Feature offer not found", 404));
       return;
    }

    // Prepare update data
    const updateData: any = {};
    
    if (title !== undefined) {
      updateData.title = title;
    }
    
    if (subtitle !== undefined) {
      updateData.subtitle = subtitle;
    }
    
    if (description !== undefined) {
      updateData.description = description;
    }
    
    if (url !== undefined) {
      updateData.url = url;
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive === 'true' || isActive === true;
    }
    
    if (order !== undefined) {
      updateData.order = parseInt(order as string);
    }

    // If there's a new image
    if (req.file) {
      updateData.image = req.file.path;
      
      // Delete the old image from cloudinary if it exists
      if (featureOffer.image) {
        const publicId = featureOffer.image.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`restaurant-features/${publicId}`);
        }
      }
    }

    // Validate the update data
    if (Object.keys(updateData).length > 0) {
      const validatedData = featureOfferUpdateValidation.parse(updateData);
      
      // Update the feature offer
      const updatedFeatureOffer = await FeatureOffer.findByIdAndUpdate(
        featureOfferId,
        validatedData,
        { new: true }
      );

       res.json({
        success: true,
        statusCode: 200,
        message: "Feature offer updated successfully",
        data: updatedFeatureOffer,
      });
      return;
    }

    // If no updates provided
     res.json({
      success: true,
      statusCode: 200,
      message: "No changes to update",
      data: featureOffer,
    });
    return;
  } catch (error) {
    // If error occurs and image was uploaded, delete it
    if (req.file?.path) {
      const publicId = req.file.path.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`restaurant-features/${publicId}`);
      }
    }
    next(error);
  }
};

export const deleteFeatureOfferById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const featureOffer = await FeatureOffer.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    
    if (!featureOffer) {
       next(new appError("Feature offer not found", 404));
       return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Feature offer deleted successfully",
      data: featureOffer,
    });
    return;
  } catch (error) {
    next(error);
  }
};