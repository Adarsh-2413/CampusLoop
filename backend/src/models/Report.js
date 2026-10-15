import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    reportedProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    reason: {
      type: String,
      required: [true, 'Report reason is required'],
      enum: {
        values: [
          'Suspicious listing',
          'Misleading description',
          'Duplicate listing',
          'Prohibited item',
          'Other'
        ],
        message: '{VALUE} is not a valid report reason'
      }
    },
    details: {
      type: String,
      required: [true, 'Report details are required'],
      maxlength: [2000, 'Details cannot exceed 2000 characters']
    },
    status: {
      type: String,
      enum: ['OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'],
      default: 'OPEN',
      index: true
    },
    adminNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const Report = mongoose.model('Report', reportSchema);
