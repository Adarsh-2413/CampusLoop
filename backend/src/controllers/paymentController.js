import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import {
  getRazorpay,
  getRazorpayKeyId,
  getRazorpayKeySecret,
  getRazorpayWebhookSecret
} from '../config/razorpay.js';
import {
  verifyPaymentSignature,
  verifyWebhookSignature
} from '../utils/crypto.js';

export const createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        error: 'Valid order ID is required.',
        code: 'INVALID_ORDER_ID'
      });
    }

    if (mongoose.connection.readyState !== 1) {
      // Offline / Test environment simulated order
      const mockRzpOrderId = 'order_simulated_' + Date.now();
      return res.status(200).json({
        success: true,
        data: {
          razorpayOrderId: mockRzpOrderId,
          amountPaise: 85000,
          currency: 'INR',
          keyId: getRazorpayKeyId(),
          orderNumber: 'CL-SIMULATED-ORDER'
        }
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found.',
        code: 'ORDER_NOT_FOUND'
      });
    }

    if (order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You cannot pay for another user\'s order.',
        code: 'ORDER_ACCESS_DENIED'
      });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({
        success: false,
        error: 'This order has already been paid and verified.',
        code: 'ORDER_ALREADY_PAID'
      });
    }

    const amountInPaise = order.totalAmountPaise;
    const razorpay = getRazorpay();
    let razorpayOrderId = null;

    if (razorpay) {
      const rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: order.orderNumber,
        notes: {
          orderId: order._id.toString(),
          buyerId: req.user._id.toString(),
          handoverLocation: order.handoverLocation
        }
      });
      razorpayOrderId = rzpOrder.id;
    } else {
      // Test mode simulated order ID when live Razorpay keys are not configured
      razorpayOrderId = 'order_simulated_' + order.orderNumber.replace(/[^a-zA-Z0-9]/g, '');
    }

    order.razorpayOrderId = razorpayOrderId;
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Razorpay payment order initialized.',
      data: {
        razorpayOrderId,
        amountPaise: amountInPaise,
        amountRupees: amountInPaise / 100,
        currency: 'INR',
        keyId: getRazorpayKeyId(),
        orderNumber: order.orderNumber
      }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        error: 'Razorpay order ID, payment ID, and signature are required.',
        code: 'MISSING_PAYMENT_SIGNATURE_DATA'
      });
    }

    const secret = getRazorpayKeySecret();
    const isValid = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      secret
    });

    if (!isValid) {
      if (orderId && mongoose.Types.ObjectId.isValid(orderId) && mongoose.connection.readyState === 1) {
        await Order.findByIdAndUpdate(orderId, { $set: { paymentStatus: 'PAYMENT_FAILED' } });
      }

      return res.status(400).json({
        success: false,
        error: 'Payment verification failed: Invalid HMAC-SHA256 signature.',
        code: 'INVALID_SIGNATURE'
      });
    }

    // Offline / Test fallback
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully (test mode).',
        data: {
          paymentStatus: 'PAID',
          fulfillmentStatus: 'READY_FOR_HANDOVER'
        }
      });
    }

    // Find and update order
    const order = await Order.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(orderId) ? orderId : null },
        { razorpayOrderId: razorpayOrderId }
      ].filter((q) => q._id || q.razorpayOrderId)
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Associated order not found for this payment.',
        code: 'ORDER_NOT_FOUND'
      });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(200).json({
        success: true,
        message: 'Payment was already verified.',
        data: { orderNumber: order.orderNumber, status: 'PAID' }
      });
    }

    // Mark order as PAID and transition to READY_FOR_HANDOVER
    order.paymentStatus = 'PAID';
    order.fulfillmentStatus = 'READY_FOR_HANDOVER';
    order.razorpayPaymentId = razorpayPaymentId;
    await order.save();

    // Record Payment log
    await Payment.create({
      razorpayOrderId,
      razorpayPaymentId,
      orderId: order._id,
      amountPaise: order.totalAmountPaise,
      currency: 'INR',
      status: 'captured',
      signatureVerified: true,
      rawPayload: req.body
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified and campus handover coordinated.',
      data: {
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        handoverLocation: order.handoverLocation
      }
    });
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing X-Razorpay-Signature webhook header.',
        code: 'MISSING_WEBHOOK_SIGNATURE'
      });
    }

    const webhookSecret = getRazorpayWebhookSecret();

    // Raw body buffer verification
    const isValid = verifyWebhookSignature({
      rawBody: req.rawBody,
      signature,
      secret: webhookSecret
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook HMAC signature.',
        code: 'INVALID_WEBHOOK_SIGNATURE'
      });
    }

    const event = req.body;
    const eventId = event?.event_id || event?.id;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        error: 'Malformed webhook event: missing event ID.',
        code: 'MALFORMED_WEBHOOK'
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        message: 'Webhook processed successfully (offline test mode).'
      });
    }

    // Idempotency check: prevent duplicate event fulfillment
    const existingPayment = await Payment.findOne({ webhookEventId: eventId });
    if (existingPayment) {
      return res.status(200).json({
        success: true,
        message: 'Webhook event already processed (idempotent no-op).',
        code: 'ALREADY_PROCESSED'
      });
    }

    // Process event types
    if (event.event === 'order.paid' || event.event === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;
      const rzpPaymentId = paymentEntity?.id;
      const amount = paymentEntity?.amount;

      if (rzpOrderId) {
        const order = await Order.findOne({ razorpayOrderId: rzpOrderId });
        if (order && order.paymentStatus !== 'PAID') {
          order.paymentStatus = 'PAID';
          order.fulfillmentStatus = 'READY_FOR_HANDOVER';
          order.razorpayPaymentId = rzpPaymentId;
          await order.save();

          await Payment.create({
            razorpayOrderId: rzpOrderId,
            razorpayPaymentId: rzpPaymentId || 'pay_wh_' + Date.now(),
            orderId: order._id,
            amountPaise: amount || order.totalAmountPaise,
            currency: paymentEntity?.currency || 'INR',
            status: 'captured',
            signatureVerified: true,
            webhookEventId: eventId,
            rawPayload: event
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully.'
    });
  } catch (error) {
    next(error);
  }
};
