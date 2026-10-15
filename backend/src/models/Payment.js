import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    razorpayOrderId: {
      type: String,
      required: true,
      index: true
    },
    razorpayPaymentId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    amountPaise: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: 'Payment amount in paise must be an integer'
      }
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      required: true
    },
    signatureVerified: {
      type: Boolean,
      default: false
    },
    // Idempotency key for webhook events to prevent duplicate processing
    webhookEventId: {
      type: String,
      unique: true,
      sparse: true
    },
    rawPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

export const Payment = mongoose.model('Payment', paymentSchema);
