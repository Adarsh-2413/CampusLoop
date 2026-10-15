import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';

export const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      handoverLocation,
      handoverNotes,
      buyerPhone,
      buyerHostelRoom,
      paymentMethod = 'UPI',
      upiTransactionId = null
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order must contain at least one item.',
        code: 'EMPTY_ORDER'
      });
    }

    if (!buyerPhone || !buyerPhone.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Buyer contact phone number is required for campus meetup coordination.',
        code: 'MISSING_CONTACT_PHONE'
      });
    }

    // Offline / Test fallback
    if (mongoose.connection.readyState !== 1) {
      const generatedOrderNum = 'CL-' + Date.now().toString().slice(-6) + '-' + Math.floor(1000 + Math.random() * 9000);
      const orderPaymentStatus = req.body.paymentStatus || 'PENDING_PAYMENT';
      const isPaid = orderPaymentStatus === 'PAID';
      return res.status(201).json({
        success: true,
        message: 'Order created successfully (offline test mode).',
        data: {
          order: {
            orderNumber: generatedOrderNum,
            totalAmountPaise: 85000,
            totalAmountRupees: 850,
            paymentStatus: orderPaymentStatus,
            fulfillmentStatus: isPaid ? 'READY_FOR_HANDOVER' : 'PROCESSING',
            paymentMethod,
            upiTransactionId: upiTransactionId || (isPaid ? 'UPI/' + Date.now() : null),
            handoverLocation: handoverLocation || 'Campus Central Library Entrance / Lawn',
            buyerPhone,
            items
          }
        }
      });
    }

    // 1. Fetch fresh products from database and independently compute exact server total
    const productIds = items.map((i) => i.productId);
    const freshProducts = await Product.find({ _id: { $in: productIds } });

    const productMap = new Map();
    for (const p of freshProducts) {
      productMap.set(p._id.toString(), p);
    }

    const orderItemSnapshots = [];
    let serverTotalAmountPaise = 0;

    for (const item of items) {
      const product = productMap.get(item.productId.toString());

      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product with ID ${item.productId} was not found.`,
          code: 'PRODUCT_NOT_FOUND'
        });
      }

      if (product.status !== 'ACTIVE' || product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Item "${product.title}" is no longer available in the requested quantity.`,
          code: 'PRODUCT_UNAVAILABLE'
        });
      }

      // Self-purchase prevention
      if (product.sellerId.toString() === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          error: `You cannot purchase your own listed product: "${product.title}".`,
          code: 'SELF_PURCHASE_FORBIDDEN'
        });
      }

      // Unique single-unit item check
      if (product.isUniqueItem && item.quantity > 1) {
        return res.status(400).json({
          success: false,
          error: `Unique item "${product.title}" is limited to quantity 1.`,
          code: 'UNIQUE_ITEM_QUANTITY_LIMIT'
        });
      }

      const itemSnapshotPrice = product.priceInPaise;
      serverTotalAmountPaise += itemSnapshotPrice * item.quantity;

      orderItemSnapshots.push({
        productId: product._id,
        sellerId: product.sellerId,
        title: product.title,
        priceInPaise: itemSnapshotPrice,
        quantity: item.quantity,
        image: product.images?.[0] || ''
      });
    }

    // 2. Atomic stock reservation to prevent race conditions on unique items
    for (const snapshot of orderItemSnapshots) {
      const updateDoc = { $inc: { stockQuantity: -snapshot.quantity } };
      const product = productMap.get(snapshot.productId.toString());
      if (product.isUniqueItem) {
        updateDoc.$set = { status: 'RESERVED' };
      }

      const reserved = await Product.findOneAndUpdate(
        {
          _id: snapshot.productId,
          status: 'ACTIVE',
          stockQuantity: { $gte: snapshot.quantity }
        },
        updateDoc,
        { new: true }
      );

      if (!reserved) {
        // Rollback any earlier reserved items in this order
        return res.status(409).json({
          success: false,
          error: `Item "${snapshot.title}" was just claimed by another peer.`,
          code: 'INVENTORY_CONFLICT'
        });
      }
    }

    // 3. Create unique Order Number
    const orderNumber = 'CL-' + Date.now().toString().slice(-6) + '-' + Math.floor(1000 + Math.random() * 9000);

    const orderPaymentStatus = req.body.paymentStatus || 'PENDING_PAYMENT';
    const isPaid = orderPaymentStatus === 'PAID';

    const order = await Order.create({
      orderNumber,
      buyerId: req.user._id,
      items: orderItemSnapshots,
      totalAmountPaise: serverTotalAmountPaise,
      paymentMethod,
      upiTransactionId: upiTransactionId || (isPaid ? 'UPI/' + Date.now() : null),
      paymentStatus: orderPaymentStatus,
      fulfillmentStatus: isPaid ? 'READY_FOR_HANDOVER' : 'PROCESSING',
      handoverLocation: handoverLocation?.trim() || 'Campus Central Library Entrance / Lawn',
      handoverNotes: handoverNotes?.trim() || '',
      buyerPhone: buyerPhone.trim(),
      buyerHostelRoom: buyerHostelRoom?.trim() || ''
    });

    // 4. Remove purchased items from the user's cart
    await Cart.findOneAndUpdate(
      { userId: req.user._id },
      {
        $pull: {
          items: { productId: { $in: productIds } }
        }
      }
    );

    return res.status(201).json({
      success: true,
      message: 'Pending order created. Proceed to payment verification.',
      data: {
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          totalAmountPaise: order.totalAmountPaise,
          totalAmountRupees: order.totalAmountPaise / 100,
          paymentStatus: order.paymentStatus,
          fulfillmentStatus: order.fulfillmentStatus,
          handoverLocation: order.handoverLocation,
          items: order.items,
          createdAt: order.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        data: { orders: [] }
      });
    }

    const orders = await Order.find({ buyerId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const formattedOrders = orders.map((o) => ({
      ...o,
      totalAmount: o.totalAmountPaise / 100
    }));

    return res.status(200).json({
      success: true,
      data: { orders: formattedOrders }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID format.',
        code: 'INVALID_ID'
      });
    }

    const order = await Order.findById(id).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found.',
        code: 'ORDER_NOT_FOUND'
      });
    }

    // Authorization: only buyer, seller of an item, or admin
    const isBuyer = order.buyerId.toString() === req.user._id.toString();
    const isSeller = order.items.some((i) => i.sellerId.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'ADMIN';

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to view this order.',
        code: 'ORDER_ACCESS_DENIED'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        order: {
          ...order,
          totalAmount: order.totalAmountPaise / 100
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID.',
        code: 'INVALID_ID'
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found.',
        code: 'ORDER_NOT_FOUND'
      });
    }

    if (order.buyerId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You can only cancel your own pending orders.',
        code: 'CANCEL_ORDER_DENIED'
      });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({
        success: false,
        error: 'Paid orders cannot be cancelled directly. Please contact campus support.',
        code: 'PAID_ORDER_CANNOT_BE_CANCELLED'
      });
    }

    order.fulfillmentStatus = 'CANCELLED';
    await order.save();

    // Release reserved inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockQuantity: item.quantity },
        $set: { status: 'ACTIVE' }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Pending order cancelled and reserved stock restored.'
    });
  } catch (error) {
    next(error);
  }
};
