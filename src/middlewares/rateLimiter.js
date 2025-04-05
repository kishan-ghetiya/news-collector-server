const rateLimit = require('express-rate-limit');

const createRateLimiter = (max, windowMs, options = {}) => {
  return rateLimit({
    max,
    windowMs,
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise use IP
      return req.user ? req.user.id : req.ip;
    },
    ...options,
  });
};

const authLimiter = createRateLimiter(20, 15 * 60 * 1000, {
  skipSuccessfulRequests: true,
});

module.exports = {
  createRateLimiter,
  authLimiter,
};
