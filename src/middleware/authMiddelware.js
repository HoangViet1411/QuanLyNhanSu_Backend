const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const authMiddleware = (req, res, next) => {
    console.log('checkToken', req.headers.token);

    if (!req.headers.token || !req.headers.token.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 'ERR',
            message: 'Token not provided or invalid format'
        });
    }

    const token = req.headers.token.split(' ')[1];

    jwt.verify(token, process.env.JWT_ACCESS_SECRET, function (err, user) {
        if (err) {
            return res.status(403).json({
                status: 'ERR',
                message: 'Unauthorized access'
            });
        }

        if (user.role === 'admin') {
            req.user = user;
            next();
        } else {
            return res.status(403).json({
                status: 'ERR',
                message: 'Access denied: Admins only'
            });
        }
    });
};

const authUserMiddleware = (req, res, next) => {
    console.log('checkToken', req.headers.token);

    if (!req.headers.token || !req.headers.token.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 'ERR',
            message: 'Token not provided or invalid format'
        });
    }

    const token = req.headers.token.split(' ')[1];
    const userId = req.params.id;

    jwt.verify(token, process.env.JWT_ACCESS_SECRET, function (err, user) {
        if (err) {
            return res.status(403).json({
                status: 'ERR',
                message: 'Unauthorized access'
            });
        }

        // So sánh đúng ID trong token và param
        if (user.role === 'admin' || user.id === userId) {
            req.user = user;
            next();
        } else {
            return res.status(403).json({
                status: 'ERR',
                message: 'Access denied: Admins or self only'
            });
        }
    });
};

module.exports = {
    authMiddleware,
    authUserMiddleware
};
