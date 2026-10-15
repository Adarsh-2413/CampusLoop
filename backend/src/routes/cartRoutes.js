import express from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart
} from '../controllers/cartController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken); // All cart routes require student authentication

router.get('/', getCart);
router.post('/items', addItemToCart);
router.patch('/items/:productId', updateCartItemQuantity);
router.delete('/items/:productId', removeCartItem);
router.delete('/', clearCart);

export default router;
