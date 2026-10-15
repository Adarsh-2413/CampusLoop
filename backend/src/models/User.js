import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'College email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required']
    },
    role: {
      type: String,
      enum: {
        values: ['BUYER', 'SELLER', 'ADMIN'],
        message: '{VALUE} is not a valid role'
      },
      default: 'BUYER'
    },
    college: {
      type: String,
      required: [true, 'College affiliation is required'],
      trim: true
    },
    department: {
      type: String,
      default: 'Engineering',
      trim: true
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    hostelRoom: {
      type: String,
      default: '',
      trim: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      default: null
    },
    emailVerificationExpires: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED'],
      default: 'ACTIVE'
    },
    upiId: {
      type: String,
      default: '',
      trim: true
    },
    upiQrCode: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Method to return public safe profile (never exposing password hash or tokens)
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  return obj;
};

export const User = mongoose.model('User', userSchema);
