import { NextFunction, Request, Response } from "express";
import { Offer } from "./offer.model";
import { offerValidation, offerUpdateValidation } from "./offer.validation";
import { appError } from "../../errors/appError";
import { cloudinary } from "../../config/cloudinary";

export const createOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { isActive, order } = req.body;
    
    // If image is uploaded through multer middleware, req.file will be available
    if (!req.file) {
       next(new appError("Offer image is required", 400));
       return;
    }

    // Get the image URL from req.file
    const image = req.file.path;
    
    // Validate the input
    const validatedData = offerValidation.parse({ 
      image,
      isActive: isActive === 'true' || isActive === true,
      order: order ? parseInt(order as string) : undefined
    });

    // Create a new offer
    const offer = new Offer(validatedData);
    await offer.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Offer created successfully",
      data: offer,
    });
    return;
  } catch (error) {
    // If error is during image upload, delete the uploaded image if any
    if (req.file?.path) {
      const publicId = req.file.path.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`restaurant-offers/${publicId}`);
      }
    }
    next(error);
  }
};

export const getAllOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get only active offers if requested
    const { active } = req.query;
    const filter: any = { isDeleted: false };
    
    if (active === 'true') {
      filter.isActive = true;
    }
    
    const offers = await Offer.find(filter).sort({ order: 1, createdAt: -1 });
    
    if (offers.length === 0) {
       res.json({
        success: true,
        statusCode: 200,
        message: "No offers found",
        data: [],
      });
      return
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Offers retrieved successfully",
      data: offers,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getOfferById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const offer = await Offer.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });
    
    if (!offer) {
      return next(new appError("Offer not found", 404));
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Offer retrieved successfully",
      data: offer,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateOfferById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const offerId = req.params.id;
    const { isActive, order } = req.body;
    
    // Find the offer to update
    const offer = await Offer.findOne({ 
      _id: offerId, 
      isDeleted: false 
    });
    
    if (!offer) {
       next(new appError("Offer not found", 404));
       return;
    }

    // Prepare update data
    const updateData: any = {};
    
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
      if (offer.image) {
        const publicId = offer.image.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`restaurant-offers/${publicId}`);
        }
      }
    }

    // Validate the update data
    if (Object.keys(updateData).length > 0) {
      const validatedData = offerUpdateValidation.parse(updateData);
      
      // Update the offer
      const updatedOffer = await Offer.findByIdAndUpdate(
        offerId,
        validatedData,
        { new: true }
      );

       res.json({
        success: true,
        statusCode: 200,
        message: "Offer updated successfully",
        data: updatedOffer,
      });
      return;
      
    }

    // If no updates provided
     res.json({
      success: true,
      statusCode: 200,
      message: "No changes to update",
      data: offer,
    });
    return;
    

  } catch (error) {
    // If error occurs and image was uploaded, delete it
    if (req.file?.path) {
      const publicId = req.file.path.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`restaurant-offers/${publicId}`);
      }
    }
    next(error);
  }
};

export const deleteOfferById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const offer = await Offer.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    
    if (!offer) {
       next(new appError("Offer not found", 404));
       return;
    }

    
    res.json({
      success: true,
      statusCode: 200,
      message: "Offer deleted successfully",
      data: offer,
    });
    return;
  } catch (error) {
    next(error);
  }
};