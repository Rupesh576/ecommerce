// Wraps an async route handler so any thrown/rejected error is forwarded to next(err)
// instead of needing a try/catch in every route.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
