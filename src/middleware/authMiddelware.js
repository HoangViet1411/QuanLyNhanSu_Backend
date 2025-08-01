const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { logger } = require('../logger');

dotenv.config();

// Middleware chỉ cho admin
const authMiddleware = (req, res, next) => {
  const token = req.headers.token;

  if (!token || !token.startsWith('Bearer ')) {
    logger.warn('Access denied: Missing or malformed token');
    return res.status(401).json({
      status: 'ERR',
      message: 'Token not provided or invalid format'
    });
  }

  const accessToken = token.split(' ')[1];

  jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET, (err, user) => {
    if (err) {
      logger.error('Invalid token: ' + err.message);
      return res.status(403).json({
        status: 'ERR',
        message: 'Unauthorized access'
      });
    }

    if (user.role !== 'admin') {
      logger.warn(`Access denied: User ${user.username} is not admin`);
      return res.status(403).json({
        status: 'ERR',
        message: 'Access denied: Admins only'
      });
    }

    logger.info(`Admin authenticated: ${user.username}`);
    req.user = user;
    next();
  });
};

// Middleware cho cả user và admin
const authUserMiddleware = (req, res, next) => {
  const token = req.headers.token;

  if (!token || !token.startsWith('Bearer ')) {
    logger.warn('Access denied: Missing or malformed token (user middleware)');
    return res.status(401).json({
      status: 'ERR',
      message: 'Token not provided or invalid format'
    });
  }

  const accessToken = token.split(' ')[1];

  jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET, (err, user) => {
    if (err) {
      logger.error('Invalid token (user middleware): ' + err.message);
      return res.status(403).json({
        status: 'ERR',
        message: 'Unauthorized access'
      });
    }

    logger.info(`User authenticated: ${user.username}, Role: ${user.role}`);
    req.user = user;
    next();
  });
};

module.exports = {
  authMiddleware,
  authUserMiddleware
};
