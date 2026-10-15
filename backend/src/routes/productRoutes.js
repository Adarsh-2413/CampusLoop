import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { verifyProductOwnership } from '../middleware/ownershipMiddleware.js';

const router = express.Router();

// Public catalog routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes (require student session)
router.post('/', authenticateToken, createProduct);
router.patch('/:id', authenticateToken, verifyProductOwnership, updateProduct);
router.delete('/:id', authenticateToken, verifyProductOwnership, deleteProduct);

export default router;
