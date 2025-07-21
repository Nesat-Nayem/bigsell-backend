import { NextFunction, Request, Response } from "express";
import { Category } from "./category.model";
import { categoryValidation, categoryUpdateValidation } from "./category.validation";
import { appError } from "../../errors/appError";
import { cloudinary } from "../../config/cloudinary";

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title } = req.body;
    
    // Check if category with same title already exists
    const existingCategory = await Category.findOne({ title, isDeleted: false });
    if (existingCategory) {
       next(new appError("Category with this title already exists", 400));
       return;
    }

    // If image is uploaded through multer middleware, req.file will be available
    if (!req.file) {
       next(new appError("Image is required", 400));
       return;
    }

    // Get the image URL from req.file
    const image = req.file.path;
    
    // Validate the input
    const validatedData = categoryValidation.parse({ 
      title, 
      image 
    });

    // Create a new category
    const category = new Category(validatedData);
    await category.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Category created successfully",
      data: category,
    });
    return;
  } catch (error) {
    // If error is during image upload, delete the uploaded image if any
    if (req.file?.path) {
      const publicId = req.file.path.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`restaurant-categories/${publicId}`);
      }
    }
    next(error);
  }
};

export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await Category.find({ isDeleted: false }).sort({ createdAt: -1 });
    
    if (categories.length === 0) {
       next(new appError("No categories found", 404));
       return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Categories retrieved successfully",
      data: categories,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });
    
    if (!category) {
       next(new appError("Category not found", 404));
       return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Category retrieved successfully",
      data: category,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categoryId = req.params.id;
    
    // Find the category to update
    const category = await Category.findOne({ 
      _id: categoryId, 
      isDeleted: false 
    });
    
    if (!category) {
       next(new appError("Category not found", 404));
       return;
    }

    // Prepare update data
    const updateData: {title?: string, image?: string} = {};
    
    if (req.body.title) {
      // Check if new title already exists
      if (req.body.title !== category.title) {
        const existingCategory = await Category.findOne({ 
          title: req.body.title, 
          isDeleted: false,
          _id: { $ne: categoryId } 
        });
        
        if (existingCategory) {
           next(new appError("Category with this title already exists", 400));
           return;
        }
      }
      updateData.title = req.body.title;
    }

    // If there's a new image
    if (req.file) {
      updateData.image = req.file.path;
      
      // Delete the old image from cloudinary if it exists
      if (category.image) {
        const publicId = category.image.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`restaurant-categories/${publicId}`);
        }
      }
    }

    // Validate the update data
    if (Object.keys(updateData).length > 0) {
      const validatedData = categoryUpdateValidation.parse(updateData);
      
      // Update the category
      const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        validatedData,
        { new: true }
      );

       res.json({
        success: true,
        statusCode: 200,
        message: "Category updated successfully",
        data: updatedCategory,
      });
      return;
    }

    // If no updates provided
     res.json({
      success: true,
      statusCode: 200,
      message: "No changes to update",
      data: category,
    });
    return;

  } catch (error) {
    // If error occurs and image was uploaded, delete it
    if (req.file?.path) {
      const publicId = req.file.path.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`restaurant-categories/${publicId}`);
      }
    }
    next(error);
  }
};

export const deleteCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    
    if (!category) {
       next(new appError("Category not found", 404));
       return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Category deleted successfully",
      data: category,
    });
    return;
  } catch (error) {
    next(error);
  }
};
