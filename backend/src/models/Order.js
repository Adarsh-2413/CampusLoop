import mongoose from 'mongoose';

const orderItemSnapshotSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    priceInPaise: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: 'Item snapshot price in paise must be an integer'
      }
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    image: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    items: {
      type: [orderItemSnapshotSchema],
      required: true,
      validate: [
        (val) => val.length > 0,
        'Order must contain at least one item'
      ]
    },
    totalAmountPaise: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: 'Order total amount in paise must be an integer'
      }
    },
    paymentStatus: {
      type: String,
      enum: [
        'PENDING_PAYMENT',
        'PAID',
        'PAYMENT_FAILED',
        'REFUND_PENDING',
        'REFUNDED'
      ],
      default: 'PENDING_PAYMENT',
      index: true
    },
    fulfillmentStatus: {
      type: String,
      enum: ['PROCESSING', 'READY_FOR_HANDOVER', 'COMPLETED', 'CANCELLED'],
      default: 'PROCESSING',
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'RAZORPAY', 'CASH_ON_HANDOVER'],
      default: 'UPI'
    },
    upiTransactionId: {
      type: String,
      default: null
    },
    razorpayOrderId: {
      type: String,
      default: null,
      index: true
    },
    razorpayPaymentId: {
      type: String,
      default: null
    },
    handoverLocation: {
      type: String,
      default: 'Campus Central Library / Student Center'
    },
    handoverNotes: {
      type: String,
      default: ''
    },
    buyerPhone: {
      type: String,
      default: ''
    },
    buyerHostelRoom: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const Order = mongoose.model('Order', orderSchema);
