const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const Product = require('../models/Product');

dotenv.config({ path: path.join(__dirname, '../.env') });

const sampleProducts = [
  {
    name: 'Wireless Noise-Canceling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation and 30-hour battery life.',
    price: 199.99,
    stock: 25,
    category: 'Electronics',
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB backlit mechanical keyboard with tactile blue switches and detachable USB-C cable.',
    price: 89.99,
    stock: 40,
    category: 'Electronics',
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'High-back mesh desk chair with adjustable lumbar support and 3D armrests.',
    price: 249.00,
    stock: 15,
    category: 'Furniture',
  },
  {
    name: 'Ultra-Wide 4K Gaming Monitor',
    description: '34-inch curved gaming display with 144Hz refresh rate and 1ms response time.',
    price: 499.99,
    stock: 10,
    category: 'Electronics',
  },
  {
    name: 'Stainless Steel Water Bottle (1L)',
    description: 'Double-walled vacuum insulated bottle that keeps drinks cold for 24 hours.',
    price: 24.50,
    stock: 80,
    category: 'Fitness',
  },
  {
    name: 'Smart Fitness Tracker Watch',
    description: 'Waterproof activity watch with heart rate monitor, sleep tracking, and GPS.',
    price: 129.95,
    stock: 35,
    category: 'Wearables',
  },
  {
    name: 'Minimalist Leather Backpack',
    description: 'Durable, water-resistant leather backpack with a 15-inch padded laptop sleeve.',
    price: 79.99,
    stock: 20,
    category: 'Accessories',
  },
  {
    name: 'Ceramic Pour-Over Coffee Maker',
    description: 'Artisan handcrafted ceramic dripper set with reusable stainless steel mesh filter.',
    price: 34.00,
    stock: 50,
    category: 'Kitchen',
  },
];

async function seed() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env');
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    // Optional: clear existing products or just insert
    const existingCount = await Product.countDocuments();
    console.log(`Current product count: ${existingCount}`);

    console.log('Inserting sample products...');
    const inserted = await Product.insertMany(sampleProducts);
    console.log(`Successfully added ${inserted.length} sample products!`);

    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding products:', err);
    process.exit(1);
  }
}

seed();
