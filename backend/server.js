const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const rateLimit = require('express-rate-limit');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();
const app = express(); 

app.use(cors());                              // Allow frontend to connect
app.use(express.json({ limit: '10mb' }));      // Parse JSON request bodies (allows image uploads)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Test route - just to check if server works
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running! 🚀' });
});

// Rate limiter: max 5 requests per minute per IP
const rupeshLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: 'Too many requests, please try again later' },
});

app.get('/rupesh', rupeshLimiter, (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Rupesh</title>
    </head>
    <body>
      <h1>Hello, Rupesh!</h1>
    </body>
    </html>
  `);
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Unmatched routes -> 404, then centralized error handler (must be registered last)
app.use(notFound);
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
