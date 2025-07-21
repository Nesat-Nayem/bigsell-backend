import { NextFunction, Response } from "express";
import { Hotel } from "../hotel/hotel.model";
import { appError } from "../../errors/appError";
import { userInterface } from "../../middlewares/userInterface";
import { User } from "../auth/auth.model";

export const addMenuBookmark = async (
  req: userInterface,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { menuItemId, hotelId } = req.body;
    const userId = req.user._id;

    // Find the hotel and menu item
    const hotel = await Hotel.findOne({ _id: hotelId, isDeleted: false });
    if (!hotel) {
      next(new appError("Hotel not found", 404));
      return;
    }

    // Find the menu item in hotel's menu categories
    let menuItem = null;
    for (const category of hotel.menuCategories) {
      const item = category.items.find(item => item.id === menuItemId);
      if (item) {
        menuItem = item;
        break;
      }
    }

    if (!menuItem) {
      next(new appError("Menu item not found", 404));
      return;
    }

    // Find user and check if already bookmarked
    const user = await User.findById(userId);
    if (!user) {
      next(new appError("User not found", 404));
      return;
    }

    // Check if already bookmarked
    const existingBookmark = user.menuBookmarks?.find(
      bookmark => (bookmark as any).menuItemId === menuItemId
    );

    if (existingBookmark) {
      next(new appError("Menu item already bookmarked", 400));
      return;
    }

    // Add bookmark
    const newBookmark = {
      menuItemId,
      hotelId,
      hotelName: hotel.name,
      menuTitle: menuItem.title,
      menuImage: menuItem.image,
      menuPrice: menuItem.price,
      bookmarkedAt: new Date()
    };

    if (!user.menuBookmarks) {
      user.menuBookmarks = [];
    }

    user.menuBookmarks.push(newBookmark as any); // Type assertion to fix TS error
    await user.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Menu item bookmarked successfully",
      data: newBookmark,
    });
  } catch (error) {
    next(error);
  }
};

export const removeMenuBookmark = async (
  req: userInterface,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { menuItemId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      next(new appError("User not found", 404));
      return;
    }

    // Find and remove bookmark
    const bookmarkIndex = user.menuBookmarks?.findIndex(
      bookmark => (bookmark as any).menuItemId === menuItemId
    );

    if (bookmarkIndex === -1 || bookmarkIndex === undefined) {
      next(new appError("Bookmark not found", 404));
      return;
    }

    user.menuBookmarks?.splice(bookmarkIndex, 1);
    await user.save();

    res.json({
      success: true,
      statusCode: 200,
      message: "Bookmark removed successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserBookmarks = async (
  req: userInterface,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      next(new appError("User not found", 404));
      return;
    }

    const bookmarks = user.menuBookmarks || [];
    
    // Sort by bookmarked date (newest first)
    const sortedBookmarks = bookmarks.sort((a: any, b: any) => 
      new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime()
    );

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedBookmarks = sortedBookmarks.slice(startIndex, endIndex);

    res.json({
      success: true,
      statusCode: 200,
      message: "Bookmarks retrieved successfully",
      data: {
        bookmarks: paginatedBookmarks,
        total: bookmarks.length,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(bookmarks.length / Number(limit))
      },
    });
  } catch (error) {
    next(error);
  }
};

export const checkBookmarkStatus = async (
  req: userInterface,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { menuItemId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      next(new appError("User not found", 404));
      return;
    }

    const isBookmarked = user.menuBookmarks?.some(
      bookmark => (bookmark as any).menuItemId === menuItemId
    ) || false;

    res.json({
      success: true,
      statusCode: 200,
      message: "Bookmark status retrieved",
      data: { isBookmarked },
    });
  } catch (error) {
    next(error);
  }
};