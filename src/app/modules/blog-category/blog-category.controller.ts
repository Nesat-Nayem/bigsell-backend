import { NextFunction, Request, Response } from 'express';
import { BlogCategory } from './blog-category.model';
import { blogCategoryValidation, blogCategoryUpdateValidation } from './blog-category.validation';
import { appError } from '../../errors/appError';

export const createBlogCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryName, status } = req.body;

    const exists = await BlogCategory.findOne({ categoryName: categoryName?.trim(), isDeleted: false });
    if (exists) {
      return next(new appError('Category with this name already exists', 400));
    }

    const validated = blogCategoryValidation.parse({ categoryName, status });
    const category = await BlogCategory.create(validated);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Blog category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const getBlogCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const query: any = { isDeleted: false };
    if (status === 'active') query.status = 'Active';
    if (status === 'inactive') query.status = 'Inactive';

    const categories = await BlogCategory.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      statusCode: 200,
      message: 'Blog categories retrieved successfully',
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getBlogCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await BlogCategory.findOne({ _id: id, isDeleted: false });
    if (!category) return next(new appError('Blog category not found', 404));

    res.json({
      success: true,
      statusCode: 200,
      message: 'Blog category retrieved successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBlogCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { categoryName, status } = req.body;

    const category = await BlogCategory.findOne({ _id: id, isDeleted: false });
    if (!category) return next(new appError('Blog category not found', 404));

    if (categoryName && categoryName !== category.categoryName) {
      const exists = await BlogCategory.findOne({ categoryName: categoryName.trim(), isDeleted: false });
      if (exists) return next(new appError('Category with this name already exists', 400));
    }

    const updateData: any = {};
    if (categoryName !== undefined) updateData.categoryName = categoryName;
    if (status !== undefined) updateData.status = status;

    const validated = blogCategoryUpdateValidation.parse(updateData);
    const updated = await BlogCategory.findByIdAndUpdate(id, validated, { new: true });

    res.json({
      success: true,
      statusCode: 200,
      message: 'Blog category updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBlogCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await BlogCategory.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!category) return next(new appError('Blog category not found', 404));

    res.json({
      success: true,
      statusCode: 200,
      message: 'Blog category deleted successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};
