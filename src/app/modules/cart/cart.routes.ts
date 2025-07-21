import express from 'express';
import { 
  addToCart, 
  getCart, 
  updateCartItem, 
  removeCartItem, 
  clearCart 
} from './cart.controller';
import { auth } from '../../middlewares/authMiddleware';


const router = express.Router();

// Add item to cart
router.post('/', auth(), addToCart);

// Get cart
router.get('/', auth(), getCart);

// Update cart item
router.patch('/item', auth(), updateCartItem);

// Remove item from cart
router.delete('/item/:itemId', auth(), removeCartItem);


// Clear cart
router.delete('/', auth(), clearCart);

export const cartRouter = router;

