const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

module.exports = function optionalAuth(req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) return next();

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      error: 'Token không hợp lệ',
      code: 'AUTH_TOKEN_INVALID',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id && !mongoose.isValidObjectId(decoded.id)) {
      return res.status(401).json({
        error: 'Token không hợp lệ',
        code: 'AUTH_TOKEN_INVALID_USER_ID',
      });
    }
    req.user = decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token hết hạn',
        code: 'AUTH_TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      error: 'Token hết hạn hoặc không hợp lệ',
      code: 'AUTH_TOKEN_INVALID',
    });
  }

  next();
};
