"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeCartItem = exports.updateCartItem = exports.getCart = exports.addToCart = void 0;
const cart_model_1 = require("./cart.model");
const hotel_model_1 = require("../hotel/hotel.model");
const cart_validation_1 = require("./cart.validation");
const appError_1 = require("../../errors/appError");
const mongoose_1 = __importDefault(require("mongoose"));
// Helper function to calculate item price
const calculateItemPrice = (hotelId, menuItemId, quantity, size, addons) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Get hotel details
    const hotel = yield hotel_model_1.Hotel.findById(hotelId);
    if (!hotel) {
        throw new appError_1.appError("Hotel not found", 404);
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
        throw new appError_1.appError("Menu item not found", 404);
    }
    // Get price for selected size
    let basePrice = 0;
    const selectedSize = (_a = menuItem.options) === null || _a === void 0 ? void 0 : _a.find(s => s.label === size);
    if (menuItem.options && menuItem.options.length > 0) {
        if (!selectedSize) {
            throw new appError_1.appError(`Size ${size} not available for this menu item`, 400);
        }
        basePrice = selectedSize.price;
    }
    else {
        basePrice = menuItem.price;
    }
    let price = basePrice; // Price for one item
    // Add addon prices if any
    if (addons && addons.length > 0 && menuItem.addons) {
        for (const addon of addons) {
            const menuItemAddon = menuItem.addons.find((a) => a.key === addon.key);
            if (!menuItemAddon) {
                throw new appError_1.appError(`Addon ${addon.key} not available for this menu item`, 400);
            }
            price += menuItemAddon.price * addon.quantity;
        }
    }
    return price * quantity; // Total price for the given quantity
});
// Helper function to get the correct cart (personal or shared table cart)
const getCartForRequest = (req) => __awaiter(void 0, void 0, void 0, function* () {
    // Check body, then query for table info
    const hotelId = req.body.hotelId || req.query.hotelId;
    const tableNumber = req.body.tableNumber || req.query.tableNumber;
    const userId = req.user._id;
    console.log("getCartForRequest - hotelId:", hotelId, "tableNumber:", tableNumber, "userId:", userId);
    if (hotelId && tableNumber) {
        const tableIdentifier = `${hotelId}_${tableNumber}`;
        console.log("Looking for cart with tableIdentifier:", tableIdentifier);
        let cart = yield cart_model_1.Cart.findOne({ tableIdentifier });
        console.log("Found cart:", cart ? "Yes" : "No");
        if (!cart) {
            console.log("Creating new cart with tableIdentifier:", tableIdentifier);
            cart = new cart_model_1.Cart({
                tableIdentifier,
                users: [userId],
                items: [],
                totalAmount: 0,
            });
        }
        else {
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
    }
    else {
        console.log("No hotelId/tableNumber provided, using personal cart");
        // Fallback to personal cart for users not at a table
        let cart = yield cart_model_1.Cart.findOne({ user: userId });
        if (!cart) {
            cart = new cart_model_1.Cart({
                user: userId,
                items: [],
                totalAmount: 0,
            });
        }
        return cart;
    }
});
// Helper to populate cart details for the response
const populateCartResponse = (cart) => __awaiter(void 0, void 0, void 0, function* () {
    const populatedCart = yield cart.populate([
        { path: 'users', select: 'name' },
        { path: 'items.orderedBy', select: 'name' }
    ]);
    const populatedItems = yield Promise.all(populatedCart.items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
        const hotel = yield hotel_model_1.Hotel.findById(item.hotelId);
        let menuItemData = null;
        if (hotel) {
            for (const category of hotel.menuCategories) {
                const menuItem = category.items.find((mi) => mi.id === item.menuItem);
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
        return Object.assign(Object.assign({}, item.toObject()), { menuItemData });
    })));
    let hotelInfo = null;
    if (populatedCart.items.length > 0) {
        const hotel = yield hotel_model_1.Hotel.findById(populatedCart.items[0].hotelId);
        if (hotel) {
            hotelInfo = {
                cgstRate: hotel.cgstRate,
                sgstRate: hotel.sgstRate,
                serviceCharge: hotel.serviceCharge
            };
        }
    }
    return Object.assign(Object.assign({}, populatedCart.toObject()), { items: populatedItems, hotelInfo });
});
// Add to cart
const addToCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { menuItemId, hotelId, quantity, size, addons = [], specialInstructions = "" } = cart_validation_1.addToCartValidation.parse(req.body);
        const cart = yield getCartForRequest(req);
        // Calculate price for the new items
        const price = yield calculateItemPrice(hotelId, menuItemId, quantity, size, addons);
        // For shared carts, treat items with different special instructions as separate entries
        const isSharedCart = !!cart.tableIdentifier;
        // Check if menu item already in cart with same size and addons
        const existingItemIndex = cart.items.findIndex(item => {
            var _a;
            return item.menuItem === menuItemId && item.size === size &&
                // For shared carts, we also need to match the user who ordered it
                // And if instructions are different, treat as a new item.
                (!isSharedCart || (((_a = item.orderedBy) === null || _a === void 0 ? void 0 : _a.equals(req.user._id)) && item.specialInstructions === specialInstructions));
        });
        if (existingItemIndex > -1 && !isSharedCart) {
            // For personal carts, just update the quantity and price
            cart.items[existingItemIndex].quantity += quantity;
            cart.items[existingItemIndex].price += price;
            if (specialInstructions) {
                cart.items[existingItemIndex].specialInstructions = specialInstructions;
            }
        }
        else {
            // Add new item
            cart.items.push({
                menuItem: menuItemId,
                hotelId: new mongoose_1.default.Types.ObjectId(hotelId),
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
        yield cart.save();
        const responseData = yield populateCartResponse(cart);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Menu item added to cart",
            data: responseData
        });
    }
    catch (error) {
        next(error);
    }
});
exports.addToCart = addToCart;
// Get cart
const getCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("getCart - query params:", req.query);
        console.log("getCart - body params:", req.body);
        const cart = yield getCartForRequest(req);
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
                    users: (cart === null || cart === void 0 ? void 0 : cart.users) || [],
                    tableIdentifier: (cart === null || cart === void 0 ? void 0 : cart.tableIdentifier) || null
                }
            });
            return;
        }
        const responseData = yield populateCartResponse(cart);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Cart retrieved successfully",
            data: responseData
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getCart = getCart;
// Update cart item
const updateCartItem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { itemId, quantity, specialInstructions } = cart_validation_1.updateCartItemValidation.parse(req.body);
        const cart = yield getCartForRequest(req);
        if (!cart) {
            next(new appError_1.appError("Cart not found", 404));
            return;
        }
        const itemIndex = cart.items.findIndex(item => { var _a; return ((_a = item._id) === null || _a === void 0 ? void 0 : _a.toString()) === itemId; });
        if (itemIndex === -1) {
            next(new appError_1.appError("Item not found in cart", 404));
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
        yield cart.save();
        const responseData = yield populateCartResponse(cart);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Cart item updated",
            data: responseData
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateCartItem = updateCartItem;
// Remove item from cart
const removeCartItem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { itemId } = req.params;
        const cart = yield getCartForRequest(req);
        if (!cart) {
            next(new appError_1.appError("Cart not found", 404));
            return;
        }
        const itemIndex = cart.items.findIndex(item => { var _a; return ((_a = item._id) === null || _a === void 0 ? void 0 : _a.toString()) === itemId; });
        if (itemIndex === -1) {
            next(new appError_1.appError("Item not found in cart", 404));
            return;
        }
        cart.items.splice(itemIndex, 1);
        cart.totalAmount = cart.items.reduce((total, item) => total + item.price, 0);
        yield cart.save();
        const responseData = yield populateCartResponse(cart);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Item removed from cart",
            data: responseData
        });
    }
    catch (error) {
        next(error);
    }
});
exports.removeCartItem = removeCartItem;
// Clear cart
const clearCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cart = yield getCartForRequest(req);
        if (cart) {
            cart.items = [];
            cart.totalAmount = 0;
            cart.appliedCouponCode = undefined;
            cart.discountAmount = 0;
            yield cart.save();
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Cart cleared",
            data: { items: [], totalAmount: 0 }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.clearCart = clearCart;
