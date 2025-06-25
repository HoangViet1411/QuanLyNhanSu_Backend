const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Middleware chỉ cho admin
const authMiddleware = (req, res, next) => {
    const token = req.headers.token;

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 'ERR',
            message: 'Token not provided or invalid format'
        });
    }

    const accessToken = token.split(' ')[1];

    jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                status: 'ERR',
                message: 'Unauthorized access'
            });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({
                status: 'ERR',
                message: 'Access denied: Admins only'
            });
        }

        req.user = user;
        next();
    });
};

// Middleware cho cả user và admin (không kiểm tra param id)
const authUserMiddleware = (req, res, next) => {
    const token = req.headers.token;

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 'ERR',
            message: 'Token not provided or invalid format'
        });
    }

    const accessToken = token.split(' ')[1];

    jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                status: 'ERR',
                message: 'Unauthorized access'
            });
        }

        req.user = user; // Gán thông tin user vào req
        next(); // Cho phép đi tiếp
    });
};

module.exports = {
    authMiddleware,
    authUserMiddleware
};
