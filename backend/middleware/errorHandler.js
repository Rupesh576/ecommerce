// Centralized error handler — every next(err) in the app ends up here.
// Must be registered LAST, and must take exactly 4 args for Express to treat it as an error handler.
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose validation error (e.g. required field missing) -> 400, not 500
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  // Mongoose bad ObjectId (e.g. malformed :id in a URL) -> 400, not 500
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  // If a route already set a non-200 status before throwing, keep it; otherwise default to 500
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({ message: err.message || 'Server Error' });
};

module.exports = errorHandler;
