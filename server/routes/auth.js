// ============================================================
// Auth Routes — /api/auth
// ============================================================
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getDB, lastId } = require('../config/database');
const { jwt: jwtCfg } = require('../config/payment');
const { authMiddleware } = require('../middleware/auth');

const signToken = (user) => jwt.sign(
    { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
    jwtCfg.secret, { expiresIn: jwtCfg.expiresIn }
);

// POST /api/auth/register
router.post('/register', [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').isLength({ min: 8 }).withMessage('Mật khẩu phải có ít nhất 8 ký tự'),
    body('full_name').notEmpty().withMessage('Vui lòng nhập họ tên'),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, full_name, phone } = req.body;
    const db = getDB();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ error: 'Email đã được sử dụng' });

    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
        'INSERT INTO users (email, password, full_name, phone) VALUES (?, ?, ?, ?)'
    ).run(email, hash, full_name, phone || null);

    const user = db.prepare('SELECT id, email, full_name, role, tier, points FROM users WHERE id = ?').get(lastId(result));
    const token = signToken(user);
    res.status(201).json({ message: 'Đăng ký thành công!', token, user });
});

// POST /api/auth/login
router.post('/login', [
    body('email').isEmail(),
    body('password').notEmpty(),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const db = getDB();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }
    if (!user.is_active) return res.status(403).json({ error: 'Tài khoản đã bị khóa' });

    const token = signToken(user);
    const { password: _, ...safeUser } = user;
    res.json({ message: 'Đăng nhập thành công!', token, user: safeUser });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
    const db = getDB();
    const user = db.prepare('SELECT id, email, full_name, phone, role, tier, points, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    res.json({ user });
});

// PUT /api/auth/password
router.put('/password', authMiddleware, [
    body('current_password').notEmpty(),
    body('new_password').isLength({ min: 8 }),
], (req, res) => {
    const { current_password, new_password } = req.body;
    const db = getDB();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!bcrypt.compareSync(current_password, user.password)) {
        return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' });
    }
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(new_password, 10), req.user.id);
    res.json({ message: 'Đổi mật khẩu thành công!' });
});

module.exports = router;
