// ============================================================
// JWT Auth Middleware
// ============================================================
const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/payment');

function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Vui lòng đăng nhập để tiếp tục' });
    }
    const token = header.slice(7);
    try {
        const payload = jwt.verify(token, jwtConfig.secret);
        req.user = payload;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Phiên đăng nhập hết hạn', code: 'TOKEN_EXPIRED' });
        }
        return res.status(401).json({ error: 'Token không hợp lệ' });
    }
}

function adminMiddleware(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Bạn không có quyền thực hiện thao tác này' });
    }
    next();
}

function optionalAuth(req, res, next) {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
        try { req.user = jwt.verify(header.slice(7), jwtConfig.secret); } catch { }
    }
    next();
}

module.exports = { authMiddleware, adminMiddleware, optionalAuth };
