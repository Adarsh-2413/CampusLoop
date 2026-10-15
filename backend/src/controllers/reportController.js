import mongoose from 'mongoose';
import { Report } from '../models/Report.js';
import { Product } from '../models/Product.js';

export const createReport = async (req, res, next) => {
  try {
    const { reportedProductId, reason, details } = req.body;

    if (!reportedProductId || !reason || !details) {
      return res.status(400).json({
        success: false,
        error: 'Reported product ID, reason, and details are required.',
        code: 'MISSING_FIELDS'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(reportedProductId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID format.',
        code: 'INVALID_ID'
      });
    }

    // Verify product exists
    const product = await Product.findById(reportedProductId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product to report does not exist.',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    const report = await Report.create({
      reporterId: req.user._id,
      reportedProductId,
      reason,
      details: details.trim(),
      status: 'OPEN'
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted for campus moderation review. Thank you.',
      data: {
        reportId: report._id,
        status: report.status
      }
    });
  } catch (error) {
    next(error);
  }
};
