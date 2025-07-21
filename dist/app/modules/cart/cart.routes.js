"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRouter = void 0;
const express_1 = __importDefault(require("express"));
const cart_controller_1 = require("./cart.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Add item to cart
router.post('/', (0, authMiddleware_1.auth)(), cart_controller_1.addToCart);
// Get cart
router.get('/', (0, authMiddleware_1.auth)(), cart_controller_1.getCart);
// Update cart item
router.patch('/item', (0, authMiddleware_1.auth)(), cart_controller_1.updateCartItem);
// Remove item from cart
router.delete('/item/:itemId', (0, authMiddleware_1.auth)(), cart_controller_1.removeCartItem);
// Clear cart
router.delete('/', (0, authMiddleware_1.auth)(), cart_controller_1.clearCart);
exports.cartRouter = router;
