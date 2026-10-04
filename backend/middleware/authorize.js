// Usage: authorize('admin') or authorize('admin', 'manager')
// Must run AFTER `protect`, since it relies on req.user being set.
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized for this action' });
  }
  next();
};

module.exports = authorize;
