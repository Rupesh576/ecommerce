const express = require('express');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const protect = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// All routes below are PROTECTED (need JWT token)

// ============ CHECKOUT (create order from cart) ============
// POST /api/orders
router.post('/', protect, asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  // Snapshot price at order time, in case product price changes later
  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    quantity: item.quantity,
    price: item.product.price,
  }));

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalAmount,
  });

  // Clear the cart after checkout
  cart.items = [];
  await cart.save();

  res.status(201).json(order);
}));

// ============ MY ORDER HISTORY ============
// GET /api/orders
router.get('/', protect, asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('items.product')
    .sort({ createdAt: -1 });
  res.json(orders);
}));

// ============ ONE ORDER ============
// GET /api/orders/:id
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.product');

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to view this order' });
  }

  res.json(order);
}));

module.exports = router;
