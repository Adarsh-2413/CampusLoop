import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Books',
          'Electronics',
          'Calculators',
          'Cycles',
          'Hostel Essentials',
          'Lab Equipment',
          'Other'
        ],
        message: '{VALUE} is not a supported category'
      },
      index: true
    },
    priceInPaise: {
      type: Number,
      required: [true, 'Price is required'],
      min: [100, 'Price must be at least ₹1 (100 paise)'],
      validate: {
        validator: Number.isInteger,
        message: 'Price in paise must be an integer'
      }
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: {
        values: ['New', 'Like New', 'Good', 'Fair'],
        message: '{VALUE} is not a valid condition'
      }
    },
    images: {
      type: [String],
      default: []
    },
    isUniqueItem: {
      type: Boolean,
      default: true
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: [0, 'Stock quantity cannot be negative'],
      default: 1
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller reference is required'],
      index: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'RESERVED', 'SOLD', 'INACTIVE'],
      default: 'ACTIVE',
      index: true
    },
    pickupLocationNote: {
      type: String,
      default: 'Campus Central Library / Student Center'
    },
    sellerUpiId: {
      type: String,
      default: ''
    },
    sellerUpiQr: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Indexes for search and fast filtering
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ category: 1, priceInPaise: 1 });
productSchema.index({ status: 1, createdAt: -1 });

export const Product = mongoose.model('Product', productSchema);
