const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const Product = require('../models/Product');

dotenv.config({ path: path.join(__dirname, '../.env') });

const imageMap = {
  'Wireless Noise-Canceling Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop',
  'Mechanical Gaming Keyboard': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&auto=format&fit=crop',
  'Ergonomic Office Chair': 'https://images.unsplash.com/photo-1580481077195-c228c3b7a8a6?w=700&auto=format&fit=crop',
  'Ultra-Wide 4K Gaming Monitor': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=700&auto=format&fit=crop',
  'Stainless Steel Water Bottle (1L)': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=700&auto=format&fit=crop',
  'Smart Fitness Tracker Watch': 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=700&auto=format&fit=crop',
  'Minimalist Leather Backpack': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&auto=format&fit=crop',
  'Ceramic Pour-Over Coffee Maker': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=700&auto=format&fit=crop',
  'Yoga Mat': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=700&auto=format&fit=crop',
  'Running Shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop',
  'Ceramic Coffee Mug': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=700&auto=format&fit=crop',
  'Wireless Headphones': 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=700&auto=format&fit=crop',
};

async function updateImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas...');

    const products = await Product.find();
    console.log(`Found ${products.length} products to check...`);

    let updatedCount = 0;
    for (const prod of products) {
      if (!prod.image && imageMap[prod.name]) {
        prod.image = imageMap[prod.name];
        await prod.save();
        updatedCount++;
        console.log(`Attached image for: ${prod.name}`);
      }
    }

    console.log(`Finished! Updated ${updatedCount} products with real images.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error updating images:', err);
    process.exit(1);
  }
}

updateImages();
