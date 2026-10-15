import mongoose from 'mongoose';
import { Product } from '../models/Product.js';

export const getProducts = async (req, res, next) => {
  try {
    const {
      q,
      category,
      condition,
      minPrice,
      maxPrice,
      sortBy = 'newest',
      page = 1,
      limit = 20,
      sellerId
    } = req.query;

    const query = { status: 'ACTIVE' };

    // Seller-specific listings (e.g. for seller dashboard)
    if (sellerId && mongoose.Types.ObjectId.isValid(sellerId)) {
      query.sellerId = sellerId;
      delete query.status; // allow seller to see their own sold/inactive listings
    }

    // Keyword search on title and description
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Condition filter
    if (condition && condition !== 'All') {
      query.condition = condition;
    }

    // Price range filter (convert rupees to paise)
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.priceInPaise = {};
      if (minPrice !== undefined && !isNaN(minPrice)) {
        query.priceInPaise.$gte = Number(minPrice) * 100;
      }
      if (maxPrice !== undefined && !isNaN(maxPrice)) {
        query.priceInPaise.$lte = Number(maxPrice) * 100;
      }
    }

    // Sort order
    let sort = { createdAt: -1 }; // default newest
    if (sortBy === 'price-low') {
      sort = { priceInPaise: 1 };
    } else if (sortBy === 'price-high') {
      sort = { priceInPaise: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Check DB connection status
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        message: 'Database is in offline mode. Configure MONGODB_URI for persistent data.',
        data: {
          products: [],
          pagination: { total: 0, page: pageNum, pages: 0, limit: limitNum }
        }
      });
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('sellerId', 'name college department createdAt isEmailVerified')
        .lean(),
      Product.countDocuments(query)
    ]);

    // Format safe response (transform sellerId to seller object)
    const formattedProducts = products.map((p) => ({
      ...p,
      price: p.priceInPaise / 100, // Rupee display helper
      seller: p.sellerId
    }));

    return res.status(200).json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum) || 1,
          limit: limitNum
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID format.',
        code: 'INVALID_ID'
      });
    }

    const product = await Product.findById(id)
      .populate('sellerId', 'name college department createdAt isEmailVerified')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product listing not found.',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        product: {
          ...product,
          price: product.priceInPaise / 100,
          seller: product.sellerId
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      price,
      condition,
      images,
      isUniqueItem = true,
      stockQuantity = 1,
      pickupLocationNote
    } = req.body;

    if (!title || !description || !category || price === undefined || !condition) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, category, price, and condition are mandatory.',
        code: 'MISSING_FIELDS'
      });
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be a positive number.',
        code: 'INVALID_PRICE'
      });
    }

    // Convert Rupees to Integer Paise
    const priceInPaise = Math.round(numericPrice * 100);

    // Enforce single-unit constraint for unique used goods
    const finalStock = isUniqueItem ? 1 : Math.max(1, parseInt(stockQuantity, 10) || 1);

    const product = await Product.create({
      title: title.trim(),
      description: description.trim(),
      category,
      priceInPaise,
      condition,
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'],
      isUniqueItem: Boolean(isUniqueItem),
      stockQuantity: finalStock,
      sellerId: req.user._id,
      pickupLocationNote: pickupLocationNote?.trim() || 'Campus Central Library / Student Center',
      status: 'ACTIVE'
    });

    return res.status(201).json({
      success: true,
      message: 'Product listing published successfully.',
      data: {
        product: {
          ...product.toObject(),
          price: numericPrice,
          seller: {
            id: req.user._id,
            name: req.user.name,
            college: req.user.college,
            department: req.user.department
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = req.product; // Attached by verifyProductOwnership middleware
    const allowedUpdates = [
      'title',
      'description',
      'category',
      'condition',
      'price',
      'images',
      'isUniqueItem',
      'stockQuantity',
      'pickupLocationNote',
      'status'
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        if (key === 'price') {
          const numericPrice = Number(req.body.price);
          if (isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({
              success: false,
              error: 'Price must be a positive number.',
              code: 'INVALID_PRICE'
            });
          }
          updates.priceInPaise = Math.round(numericPrice * 100);
        } else {
          updates[key] = req.body[key];
        }
      }
    }

    if (updates.isUniqueItem) {
      updates.stockQuantity = 1;
    }

    const updated = await Product.findByIdAndUpdate(
      product._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Product listing updated successfully.',
      data: {
        product: {
          ...updated.toObject(),
          price: updated.priceInPaise / 100
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = req.product;
    // Soft delete: mark INACTIVE
    product.status = 'INACTIVE';
    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product listing removed from campus catalog.'
    });
  } catch (error) {
    next(error);
  }
};
