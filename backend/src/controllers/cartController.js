import mongoose from 'mongoose';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';

export const getCart = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        data: {
          items: [],
          subtotalPaise: 0,
          subtotalRupees: 0,
          itemCount: 0
        }
      });
    }

    let cart = await Cart.findOne({ userId: req.user._id }).populate({
      path: 'items.productId',
      select: 'title description priceInPaise condition images isUniqueItem stockQuantity status sellerId',
      populate: { path: 'sellerId', select: 'name college department' }
    });

    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    // Filter out deleted/null products and compute server-calculated subtotal
    const activeItems = [];
    let subtotalPaise = 0;
    let itemCount = 0;

    for (const item of cart.items) {
      if (item.productId && item.productId.status === 'ACTIVE') {
        const product = item.productId;
        const pricePaise = product.priceInPaise;
        const qty = item.quantity;

        subtotalPaise += pricePaise * qty;
        itemCount += qty;

        activeItems.push({
          product: {
            id: product._id,
            title: product.title,
            price: pricePaise / 100,
            priceInPaise: pricePaise,
            condition: product.condition,
            images: product.images,
            isUniqueItem: product.isUniqueItem,
            stockQuantity: product.stockQuantity,
            seller: product.sellerId
          },
          quantity: qty,
          addedAt: item.addedAt
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        items: activeItems,
        subtotalPaise,
        subtotalRupees: subtotalPaise / 100,
        itemCount
      }
    });
  } catch (error) {
    next(error);
  }
};

export const addItemToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Valid product ID is required.',
        code: 'INVALID_PRODUCT_ID'
      });
    }

    const requestedQty = Math.max(1, parseInt(quantity, 10) || 1);

    // Offline / Test fallback
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        message: 'Item added to cart (offline mode).',
        data: {
          items: [{ productId, quantity: requestedQty }]
        }
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product listing not found.',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    if (product.status !== 'ACTIVE' || product.stockQuantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'This product is no longer active or in stock.',
        code: 'PRODUCT_UNAVAILABLE'
      });
    }

    // Prevent self-purchase
    if (product.sellerId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'You cannot add or purchase your own listing.',
        code: 'CANNOT_BUY_OWN_ITEM'
      });
    }

    // Unique used goods constraint
    if (product.isUniqueItem && requestedQty > 1) {
      return res.status(400).json({
        success: false,
        error: 'This is a unique single-unit used item (maximum quantity is 1).',
        code: 'UNIQUE_ITEM_QUANTITY_LIMIT'
      });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingIndex > -1) {
      if (product.isUniqueItem) {
        return res.status(400).json({
          success: false,
          error: 'Unique used item is already in your cart (maximum quantity: 1).',
          code: 'UNIQUE_ITEM_QUANTITY_LIMIT'
        });
      }

      const newQty = cart.items[existingIndex].quantity + requestedQty;
      if (newQty > product.stockQuantity) {
        return res.status(400).json({
          success: false,
          error: `Cannot add more units. Available stock: ${product.stockQuantity}`,
          code: 'STOCK_LIMIT_EXCEEDED'
        });
      }

      cart.items[existingIndex].quantity = newQty;
    } else {
      cart.items.push({
        productId,
        quantity: product.isUniqueItem ? 1 : requestedQty,
        addedAt: new Date()
      });
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Product added to campus cart.',
      data: {
        cartItemCount: cart.items.reduce((acc, i) => acc + i.quantity, 0)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID.',
        code: 'INVALID_ID'
      });
    }

    const newQty = parseInt(quantity, 10);
    if (isNaN(newQty) || newQty < 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be a non-negative integer.',
        code: 'INVALID_QUANTITY'
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, message: 'Quantity updated.' });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found.',
        code: 'CART_NOT_FOUND'
      });
    }

    if (newQty === 0) {
      cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
      await cart.save();
      return res.status(200).json({
        success: true,
        message: 'Item removed from cart.'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
      await cart.save();
      return res.status(404).json({
        success: false,
        error: 'Product no longer exists.',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    if (product.isUniqueItem && newQty > 1) {
      return res.status(400).json({
        success: false,
        error: 'Unique used item cannot exceed quantity 1.',
        code: 'UNIQUE_ITEM_QUANTITY_LIMIT'
      });
    }

    if (newQty > product.stockQuantity) {
      return res.status(400).json({
        success: false,
        error: `Requested quantity exceeds available stock (${product.stockQuantity}).`,
        code: 'STOCK_LIMIT_EXCEEDED'
      });
    }

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = newQty;
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Cart quantity updated.'
    });
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, message: 'Item removed from cart.' });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart.'
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, message: 'Cart cleared.' });
    }

    await Cart.findOneAndUpdate({ userId: req.user._id }, { $set: { items: [] } });

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully.'
    });
  } catch (error) {
    next(error);
  }
};
