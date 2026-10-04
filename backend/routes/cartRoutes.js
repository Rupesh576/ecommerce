const express = require('express');
const { body } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const protect = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// All routes below are PROTECTED (need JWT token)

// ============ GET MY CART ============
// GET /api/cart
router.get('/', protect, asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  res.json(cart);
}));

// ============ ADD ITEM TO CART ============
// POST /api/cart
router.post('/', protect, [
  body('productId').notEmpty().withMessage('productId is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
], validate, asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find((item) => item.product.toString() === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  await cart.populate('items.product');
  res.status(201).json(cart);
}));

// ============ UPDATE ITEM QUANTITY ============
// PUT /api/cart/:productId
router.put('/:productId', protect, [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
], validate, asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  const item = cart.items.find((item) => item.product.toString() === req.params.productId);
  if (!item) {
    return res.status(404).json({ message: 'Item not found in cart' });
  }

  item.quantity = quantity;
  await cart.save();
  await cart.populate('items.product');
  res.json(cart);
}));

// ============ REMOVE ITEM FROM CART ============
// DELETE /api/cart/:productId
router.delete('/:productId', protect, asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
  await cart.save();
  await cart.populate('items.product');
  res.json(cart);
}));

module.exports = router;
