import Product from '../models/Product.js';
import mongoose from 'mongoose';

const normalizeProductPayload = (body = {}) => {
  const payload = { ...body };

  if (Array.isArray(body.images)) {
    const hasStringImages = body.images.some((img) => typeof img === 'string');
    if (hasStringImages) {
      payload.images = body.images
        .filter((url) => typeof url === 'string' && url.trim() !== '')
        .map((url) => ({ url: url.trim() }));
    }
  }

  if (body.stock !== undefined && body.stock !== null) {
    if (typeof body.stock === 'number' || typeof body.stock === 'string') {
      const quantity = Number(body.stock);
      payload.stock = { quantity: Number.isFinite(quantity) ? quantity : 0 };
    }
  }

  return payload;
};

// Get all products
export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      isActive,
      isFeatured,
      search,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Safe pagination with validation
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create product
export const createProduct = async (req, res, next) => {
  try {
    const productData = normalizeProductPayload({
      ...req.body,
      createdBy: req.user.id
    });

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    next(error);
  }
};

// Update product
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const payload = normalizeProductPayload(req.body);
    Object.assign(product, payload);
    product.updatedBy = req.user.id;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    next(error);
  }
};

// Delete product
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
