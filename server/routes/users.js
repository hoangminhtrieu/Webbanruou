// ============================================================
// Users Routes — /api/users (profile, wishlist)
// ============================================================
const router = require('express').Router();
const { getDB } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/users/profile
router.get('/profile', (req, res) => {
    const db = getDB();
    const user = db.prepare('SELECT id, email, full_name, phone, tier, points, created_at FROM users WHERE id = ?').get(req.user.id);
    res.json({ user });
});

// PUT /api/users/profile
router.put('/profile', (req, res) => {
    const { full_name, phone } = req.body;
    const db = getDB();
    db.prepare('UPDATE users SET full_name = ?, phone = ?, updated_at = datetime("now") WHERE id = ?').run(full_name, phone, req.user.id);
    res.json({ message: 'Cập nhật thông tin thành công' });
});

// GET /api/users/wishlist
router.get('/wishlist', (req, res) => {
    const db = getDB();
    const items = db.prepare(`
    SELECT p.id, p.name, p.price, p.img, p.rating, p.region, p.type, p.stock
    FROM wishlists w JOIN products p ON w.product_id = p.id
    WHERE w.user_id = ? AND p.is_active = 1
  `).all(req.user.id);
    res.json({ items });
});

// POST /api/users/wishlist
router.post('/wishlist', (req, res) => {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ error: 'Thiếu product_id' });
    const db = getDB();
    try {
        db.prepare('INSERT OR IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)').run(req.user.id, product_id);
        res.json({ message: 'Đã thêm vào yêu thích' });
    } catch { res.status(400).json({ error: 'Không thể thêm' }); }
});

// DELETE /api/users/wishlist/:product_id
router.delete('/wishlist/:product_id', (req, res) => {
    const db = getDB();
    db.prepare('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.product_id);
    res.json({ message: 'Đã xóa khỏi yêu thích' });
});

// POST /api/users/reviews
router.post('/reviews', (req, res) => {
    const { product_id, rating, comment } = req.body;
    if (!product_id || !rating) return res.status(400).json({ error: 'Thiếu thông tin đánh giá' });
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Điểm đánh giá phải từ 1-5' });
    const db = getDB();
    try {
        db.prepare('INSERT OR REPLACE INTO reviews (product_id, user_id, rating, comment) VALUES (?,?,?,?)').run(product_id, req.user.id, rating, comment || null);
        // Update avg rating
        const avg = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE product_id = ?').get(product_id);
        db.prepare('UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?').run(Math.round(avg.avg * 10) / 10, avg.cnt, product_id);
        res.json({ message: 'Đánh giá thành công!' });
    } catch (e) { res.status(400).json({ error: e.message }); }
});

module.exports = router;
