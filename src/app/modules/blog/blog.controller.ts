import { NextFunction, Request, Response } from "express";
import { Blog } from "./blog.model";
import { blogValidation, updateBlogValidation } from "./blog.validation";
import { appError } from "../../errors/appError";
import { cloudinary } from "../../config/cloudinary";
// import cloudinary from "../../config/cloudinary";

// Get all blogs
export const getBlogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.query;
    
    // Build query
    const query: any = { isDeleted: false };
    
    // Add status filter if provided
    if (status === 'active') {
      query.status = 'Active';
    } else if (status === 'inactive') {
      query.status = 'Inactive';
    }
    
    // Get blogs
    const blogs = await Blog.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      statusCode: 200,
      message: "Blogs retrieved successfully",
      data: blogs,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get blog by ID
export const getBlogById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Find blog
    const blog = await Blog.findOne({ _id: id, isDeleted: false });
    
    if (!blog) {
      next(new appError("Blog not found", 404));
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Blog retrieved successfully",
      data: blog,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Create blog
export const createBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, shortDesc, longDesc, status, category } = req.body;
    
    // Check if blog with same title already exists
    const existingBlog = await Blog.findOne({ title, isDeleted: false });
    if (existingBlog) {
      next(new appError("Blog with this title already exists", 400));
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
    const validatedData = blogValidation.parse({ 
      title, 
      shortDesc,
      longDesc,
      image,
      category,
      status: status === 'Active' || status === true || status === 'true' ? 'Active' : 'Inactive'
    });

    // Create a new blog
    const blog = new Blog(validatedData);
    await blog.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Blog created successfully",
      data: blog,
    });
    return;
  } catch (error) {
    // If error is during image upload, delete the uploaded image if any
    if (req.file?.path) {
      const publicId = req.file.path.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`restaurant-blogs/${publicId}`);
      }
    }
    next(error);
  }
};

// Update blog
export const updateBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { title, shortDesc, longDesc, status, category } = req.body;
    
    // Find blog
    const blog = await Blog.findOne({ _id: id, isDeleted: false });
    
    if (!blog) {
      next(new appError("Blog not found", 404));
      return;
    }

    // Check if title is being updated and if it already exists
    if (title && title !== blog.title) {
      const existingBlog = await Blog.findOne({ title, isDeleted: false });
      if (existingBlog) {
        next(new appError("Blog with this title already exists", 400));
        return;
      }
    }

    // Prepare update data
    const updateData: any = {
      title: title || blog.title,
      shortDesc: shortDesc || blog.shortDesc,
      longDesc: longDesc || blog.longDesc,
      category: category || blog.category,
      status: status === 'Active' || status === true || status === 'true' ? 'Active' : 'Inactive'
    };

    // If image is uploaded
    if (req.file) {
      // Delete old image from cloudinary
      const oldImagePublicId = blog.image.split('/').pop()?.split('.')[0];
      if (oldImagePublicId) {
        await cloudinary.uploader.destroy(`restaurant-blogs/${oldImagePublicId}`);
      }
      
      // Add new image URL
      updateData.image = req.file.path;
    }
    
    // Validate the input
    const validatedData = updateBlogValidation.parse(updateData);

    // Update blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      validatedData,
      { new: true }
    );

    res.json({
      success: true,
      statusCode: 200,
      message: "Blog updated successfully",
      data: updatedBlog,
    });
    return;
  } catch (error) {
    // If error is during image upload, delete the uploaded image if any
    if (req.file?.path) {
      const publicId = req.file.path.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`restaurant-blogs/${publicId}`);
      }
    }
    next(error);
  }
};

// Delete blog
export const deleteBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Find blog
    const blog = await Blog.findOne({ _id: id, isDeleted: false });
    
    if (!blog) {
      next(new appError("Blog not found", 404));
      return;
    }

    // Soft delete the blog
    blog.isDeleted = true;
    await blog.save();

    res.json({
      success: true,
      statusCode: 200,
      message: "Blog deleted successfully",
      data: blog,
    });
    return;
  } catch (error) {
    next(error);
  }
};