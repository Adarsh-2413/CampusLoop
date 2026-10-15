import mongoose from 'mongoose';
import { Product } from '../models/Product.js';

/**
 * Middleware to verify that the authenticated user is the owner of the product
 * Admins are also permitted to moderate listings.
 */
export const verifyProductOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID format.',
        code: 'INVALID_ID'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product listing not found.',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    const isOwner = product.sellerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You can only modify your own listings.',
        code: 'NOT_PRODUCT_OWNER'
      });
    }

    req.product = product;
    next();
  } catch (error) {
    next(error);
  }
};
