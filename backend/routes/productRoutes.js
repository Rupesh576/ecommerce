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
  const { name, description, price, stock, category } = req.body;

  const product = await Product.create({ name, description, price, stock, category });

  res.status(201).json(product);
}));

module.exports = router;