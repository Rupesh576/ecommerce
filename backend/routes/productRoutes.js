const express = require('express');
const { body } = require('express-validator');
const Product = require('../models/Product');
const protect = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// ============ LIST PRODUCTS (public) ============
// GET /api/products
router.get('/', asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
}));

// ============ GET ONE PRODUCT (public) ============
// GET /api/products/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
}));

// ============ CREATE PRODUCT (admin only) ============
// POST /api/products
router.post('/', protect, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
], validate, asyncHandler(async (req, res) => {
  const { name, description, price, stock, category, image } = req.body;

  const product = await Product.create({
    name,
    description,
    price,
    stock,
    category,
    image: image || '',
  });

  res.status(201).json(product);
}));

// ============ UPDATE PRODUCT (admin only) ============
// PUT /api/products/:id
router.put('/:id', protect, authorize('admin'), [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
], validate, asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const { name, description, price, stock, category, image } = req.body;
  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  if (stock !== undefined) product.stock = stock;
  if (category !== undefined) product.category = category;
  if (image !== undefined) product.image = image;

  const updatedProduct = await product.save();
  res.json(updatedProduct);
}));

// ============ DELETE PRODUCT (admin only) ============
// DELETE /api/products/:id
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  await product.deleteOne();
  res.json({ message: 'Product deleted successfully', _id: req.params.id });
}));

module.exports = router;