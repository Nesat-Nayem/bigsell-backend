import { NextFunction, Request, Response } from "express";
import { MustTry } from "./musttry.model";
import { mustTryValidation, mustTryUpdateValidation } from "./musttry.validation";
import { appError } from "../../errors/appError";
import { cloudinary } from "../../config/cloudinary";

export const createMustTry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, isActive, order } = req.body;
    
    // If image is uploaded through multer middleware, req.file will be available
    if (!req.file) {
       next(new appError("MustTry image is required", 400));
       return;
    }

    // Get the image URL from req.file
    const image = req.file.path;
    
    // Validate the input
    const validatedData = mustTryValidation.parse({ 
      title, 
      image,
      isActive: isActive === 'true' || isActive === true,
      order: order ? parseInt(order as string) : undefined
    });

    // Create a new mustTry
    const mustTry = new MustTry(validatedData);
    await mustTry.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "MustTry item created successfully",
      data: mustTry,
    });
    return;
  } catch (error) {
    // If error is during image upload, delete the uploaded image if any
    if (req.file?.path) {
      const publicId = req.file.path.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`restaurant-musttry/${publicId}`);
      }
    }
    next(error);
  }
};

export const getAllMustTry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get only active items if requested
    const { active } = req.query;
    const filter: any = { isDeleted: false };
    
    if (active === 'true') {
      filter.isActive = true;
    }
    
    const mustTryItems = await MustTry.find(filter).sort({ order: 1, createdAt: -1 });
    
    if (mustTryItems.length === 0) {
       res.json({
        success: true,
        statusCode: 200,
        message: "No MustTry items found",
        data: [],
      });
      return
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "MustTry items retrieved successfully",
      data: mustTryItems,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getMustTryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const mustTry = await MustTry.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });
    
    if (!mustTry) {
      return next(new appError("MustTry item not found", 404));
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "MustTry item retrieved successfully",
      data: mustTry,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateMustTryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const mustTryId = req.params.id;
    const { title, isActive, order } = req.body;
    
    // Find the mustTry to update
    const mustTry = await MustTry.findOne({ 
      _id: mustTryId, 
      isDeleted: false 
    });
    
    if (!mustTry) {
       next(new appError("MustTry item not found", 404));
       return;
    }

    // Prepare update data
    const updateData: any = {};
    
    if (title !== undefined) {
      updateData.title = title;
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
      if (mustTry.image) {
        const publicId = mustTry.image.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`restaurant-musttry/${publicId}`);
        }
      }
    }

    // Validate the update data
    if (Object.keys(updateData).length > 0) {
      const validatedData = mustTryUpdateValidation.parse(updateData);
      
      // Update the mustTry
      const updatedMustTry = await MustTry.findByIdAndUpdate(
        mustTryId,
        validatedData,
        { new: true }
      );

       res.json({
        success: true,
        statusCode: 200,
        message: "MustTry item updated successfully",
        data: updatedMustTry,
      });
      return;
    }

    // If no updates provided
     res.json({
      success: true,
      statusCode: 200,
      message: "No changes to update",
      data: mustTry,
    });
    return;
  } catch (error) {
    // If error occurs and image was uploaded, delete it
    if (req.file?.path) {
      const publicId = req.file.path.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`restaurant-musttry/${publicId}`);
      }
    }
    next(error);
  }
};

export const deleteMustTryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const mustTry = await MustTry.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    
    if (!mustTry) {
       next(new appError("MustTry item not found", 404));
       return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "MustTry item deleted successfully",
      data: mustTry,
    });
    return;
  } catch (error) {
    next(error);
  }
};