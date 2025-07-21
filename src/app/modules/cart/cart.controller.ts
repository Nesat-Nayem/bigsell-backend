import { NextFunction, Request, Response } from "express";
import { Cart } from "./cart.model";
import { Hotel } from "../hotel/hotel.model";
import { addToCartValidation, updateCartItemValidation } from "./cart.validation";
import { appError } from "../../errors/appError";
import mongoose from "mongoose";
import { userInterface } from "../../middlewares/userInterface";

// Helper function to calculate item price
const calculateItemPrice = async (hotelId: string, menuItemId: string, quantity: number, size: string, addons: any[]) => {
  // Get hotel details
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    throw new appError("Hotel not found", 404);
  }
  
  // Find the menu item in any category
  let menuItem = null;
  for (const category of hotel.menuCategories) {
    const item = category.items.find(item => item.id === menuItemId);
    if (item) {
      menuItem = item;
      break;
    }
  }
  
  if (!menuItem) {
    throw new appError("Menu item not found", 404);
  }

  // Get price for selected size
  let basePrice = 0;
  const selectedSize = menuItem.options?.find(s => s.label === size);
    
  if (menuItem.options && menuItem.options.length > 0) {
    if (!selectedSize) {
      throw new appError(`Size ${size} not available for this menu item`, 400);
    }
    basePrice = selectedSize.price;
  } else {
    basePrice = menuItem.price;
  }
  
  let price = basePrice; // Price for one item
  
  // Add addon prices if any
  if (addons && addons.length > 0 && menuItem.addons) {
    for (const addon of addons) {
   const menuItemAddon = menuItem.addons.find((a: { key: string; price: number }) => a.key === addon.key);
      if (!menuItemAddon) {
        throw new appError(`Addon ${addon.key} not available for this menu item`, 400);
      }
      price += menuItemAddon.price * addon.quantity;
    }
  }
  
  return price * quantity; // Total price for the given quantity
};



// Helper function to get the correct cart (personal or shared table cart)
const getCartForRequest = async (req: userInterface) => {
    // Check body, then query for table info
    const hotelId = req.body.hotelId || req.query.hotelId;
    const tableNumber = req.body.tableNumber || req.query.tableNumber;
    const userId = req.user._id;

    console.log("getCartForRequest - hotelId:", hotelId, "tableNumber:", tableNumber, "userId:", userId);

    if (hotelId && tableNumber) {
        const tableIdentifier = `${hotelId}_${tableNumber}`;
        console.log("Looking for cart with tableIdentifier:", tableIdentifier);
        
        let cart = await Cart.findOne({ tableIdentifier });
        console.log("Found cart:", cart ? "Yes" : "No");


        if (!cart) {
            console.log("Creating new cart with tableIdentifier:", tableIdentifier);
            cart = new Cart({
                tableIdentifier,
                users: [userId],
                items: [],
                totalAmount: 0,
            });
        } else {
            // Add user to the shared cart if they aren't already in it
            if (!cart.users) {
                cart.users = [];
            }
            if (!cart.users.find(u => u.equals(userId))) {
                cart.users.push(userId);
                console.log("Added user to existing cart");
            }
        }
        return cart;
    } else {
        console.log("No hotelId/tableNumber provided, using personal cart");
        // Fallback to personal cart for users not at a table
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({
                user: userId,
                items: [],
                totalAmount: 0,
            });
        }
        return cart;
    }
};

// Helper to populate cart details for the response
const populateCartResponse = async (cart: any) => {
  const populatedCart = await cart.populate([
    { path: 'users', select: 'name' },
    { path: 'items.orderedBy', select: 'name' }
  ]);

  const populatedItems = await Promise.all(populatedCart.items.map(async (item: any) => {
    const hotel = await Hotel.findById(item.hotelId);
    let menuItemData = null;
    if (hotel) {
      for (const category of hotel.menuCategories) {
        const menuItem = category.items.find((mi: any) => mi.id === item.menuItem);
        if (menuItem) {
          menuItemData = {
            id: menuItem.id,
            title: menuItem.title,
            image: menuItem.image,
            description: menuItem.description,
            price: menuItem.price, // Base price
            sizes: menuItem.options,
            addons: menuItem.addons,
            category: category.name,
          };
          break;
        }
      }
    }
    return { ...item.toObject(), menuItemData };
  }));

  let hotelInfo = null;
  if (populatedCart.items.length > 0) {
      const hotel = await Hotel.findById(populatedCart.items[0].hotelId);
      if (hotel) {
        hotelInfo = {
          cgstRate: hotel.cgstRate,
          sgstRate: hotel.sgstRate,
          serviceCharge: hotel.serviceCharge
        };
      }
    }

  return {
    ...populatedCart.toObject(),
    items: populatedItems,
    hotelInfo
  };
};

// Add to cart
export const addToCart = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { menuItemId, hotelId, quantity, size, addons = [] , specialInstructions = "" } = addToCartValidation.parse(req.body);
    
    const cart = await getCartForRequest(req);
    
    // Calculate price for the new items
    const price = await calculateItemPrice(hotelId, menuItemId, quantity, size, addons);
    
    // For shared carts, treat items with different special instructions as separate entries
    const isSharedCart = !!cart.tableIdentifier;

    // Check if menu item already in cart with same size and addons
    const existingItemIndex = cart.items.findIndex(
      item => item.menuItem === menuItemId && item.size === size && 
              // For shared carts, we also need to match the user who ordered it
              // And if instructions are different, treat as a new item.
              (!isSharedCart || (item.orderedBy?.equals(req.user._id) && item.specialInstructions === specialInstructions))
    );
    
    if (existingItemIndex > -1 && !isSharedCart) {
       // For personal carts, just update the quantity and price
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].price += price;
      if (specialInstructions) {
        cart.items[existingItemIndex].specialInstructions = specialInstructions;
      }
    } else {
      // Add new item
      cart.items.push({
        menuItem: menuItemId,
        hotelId: new mongoose.Types.ObjectId(hotelId),
        quantity,
        size,
        addons,
        price,
        specialInstructions,
        orderedBy: req.user._id
      });
    }
    
    // Recalculate total
    cart.totalAmount = cart.items.reduce((total, item) => total + item.price, 0);
    
    await cart.save();
    
    const responseData = await populateCartResponse(cart);
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Menu item added to cart",
      data: responseData
    });
    
  } catch (error) {
    next(error);
  }
};

// Get cart
export const getCart = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("getCart - query params:", req.query);
    console.log("getCart - body params:", req.body);
    
    const cart = await getCartForRequest(req);
    
    console.log("getCart - found cart:", cart ? cart._id : "none");
    console.log("getCart - cart items count:", cart ? cart.items.length : 0);
    
    if (!cart || cart.items.length === 0) {
       res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Cart is empty",
        data: {
          items: [],
          totalAmount: 0,
          users: cart?.users || [],
          tableIdentifier: cart?.tableIdentifier || null
        }
      });
      return;
    }

    const responseData = await populateCartResponse(cart);
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Cart retrieved successfully",
      data: responseData
    });
    
  } catch (error) {
    next(error);
  }
};

// Update cart item
export const updateCartItem = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { itemId, quantity, specialInstructions } = updateCartItemValidation.parse(req.body);
    
    const cart = await getCartForRequest(req);
    
    if (!cart) {
       next(new appError("Cart not found", 404));
       return;
    }
    
    const itemIndex = cart.items.findIndex(item => item._id?.toString() === itemId);
  
    if (itemIndex === -1) {
       next(new appError("Item not found in cart", 404));
       return;
    }
    
    const itemToUpdate = cart.items[itemIndex];
    
    const oldQuantity = itemToUpdate.quantity;
    const pricePerItem = itemToUpdate.price / oldQuantity;

    if (quantity) {
        itemToUpdate.quantity = quantity;
        itemToUpdate.price = pricePerItem * quantity;
    }
    if (specialInstructions !== undefined) {
        itemToUpdate.specialInstructions = specialInstructions;
    }

    cart.items[itemIndex] = itemToUpdate;
    
    // Recalculate total
    cart.totalAmount = cart.items.reduce((total, item) => total + item.price, 0);
    
    await cart.save();

    const responseData = await populateCartResponse(cart);
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Cart item updated",
      data: responseData
    });
    
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
export const removeCartItem = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { itemId } = req.params;
    
    const cart = await getCartForRequest(req);
    
    if (!cart) {
       next(new appError("Cart not found", 404));
       return;
    }
    
    const itemIndex = cart.items.findIndex(item => item._id?.toString() === itemId);
      
    if (itemIndex === -1) {
       next(new appError("Item not found in cart", 404));
       return;
    }
    
    cart.items.splice(itemIndex, 1);
    
    cart.totalAmount = cart.items.reduce((total, item) => total + item.price, 0);
    
    await cart.save();
    
    const responseData = await populateCartResponse(cart);
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Item removed from cart",
      data: responseData
    });
    
  } catch (error) {
    next(error);
  }
};

// Clear cart
export const clearCart = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const cart = await getCartForRequest(req);
    
    if (cart) {
      cart.items = [];
      cart.totalAmount = 0;
      cart.appliedCouponCode = undefined;
      cart.discountAmount = 0;
      await cart.save();
    }
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Cart cleared",
      data: { items: [], totalAmount: 0 }
    });
    
  } catch (error) {
    next(error);
  }
};
