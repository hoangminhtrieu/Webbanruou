// ============================================================
// Cart Routes — /api/cart
// ============================================================
const router = require('express').Router();
const { getDB } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// GET /api/cart
router.get('/', authMiddleware, (req, res) => {
    const db = getDB();
    const items = db.prepare(`
    SELECT c.id, c.qty, p.id as product_id, p.name, p.price, p.img, p.volume, p.region, p.stock
    FROM cart_items c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `).all(req.user.id);
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    res.json({ items, total });
});

// POST /api/cart — Add or update item
router.post('/', authMiddleware, (req, res) => {
    const { product_id, qty = 1 } = req.body;
    if (!product_id) return res.status(400).json({ error: 'Thiếu product_id' });
    const db = getDB();
    const product = db.prepare('SELECT id, stock FROM products WHERE id = ? AND is_active = 1').get(product_id);
    if (!product) return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    const existing = db.prepare('SELECT id, qty FROM cart_items WHERE user_id = ? AND product_id = ?').get(req.user.id, product_id);
    if (existing) {
        const newQty = Math.min(existing.qty + qty, product.stock);
        db.prepare('UPDATE cart_items SET qty = ? WHERE id = ?').run(newQty, existing.id);
    } else {
        db.prepare('INSERT INTO cart_items (user_id, product_id, qty) VALUES (?, ?, ?)').run(req.user.id, product_id, Math.min(qty, product.stock));
    }
    res.json({ message: 'Đã thêm vào giỏ hàng' });
});

// PUT /api/cart/:product_id — Update qty
router.put('/:product_id', authMiddleware, (req, res) => {
    const { qty } = req.body;
    if (!qty || qty < 0) return res.status(400).json({ error: 'Số lượng không hợp lệ' });
    const db = getDB();
    if (qty === 0) {
        db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.product_id);
        return res.json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng' });
    }
    const product = db.prepare('SELECT stock FROM products WHERE id = ?').get(req.params.product_id);
    const newQty = Math.min(qty, product?.stock || qty);
    db.prepare('UPDATE cart_items SET qty = ? WHERE user_id = ? AND product_id = ?').run(newQty, req.user.id, req.params.product_id);
    res.json({ message: 'Cập nhật giỏ hàng thành công', qty: newQty });
});

// DELETE /api/cart/:product_id
router.delete('/:product_id', authMiddleware, (req, res) => {
    const db = getDB();
    db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.product_id);
    res.json({ message: 'Đã xóa sản phẩm' });
});

// DELETE /api/cart — Clear cart
router.delete('/', authMiddleware, (req, res) => {
    const db = getDB();
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
    res.json({ message: 'Đã xóa toàn bộ giỏ hàng' });
});

// POST /api/cart/merge — Merge localStorage cart khi đăng nhập
router.post('/merge', authMiddleware, (req, res) => {
    const { items = [] } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'items phải là mảng' });
    const db = getDB();
    let merged = 0;
    for (const item of items) {
        const pid = item.product_id || item.productId;
        const qty = Math.max(1, +item.qty || 1);
        if (!pid) continue;
        const product = db.prepare('SELECT id, stock FROM products WHERE id = ? AND is_active = 1').get(pid);
        if (!product) continue;
        const existing = db.prepare('SELECT id, qty FROM cart_items WHERE user_id = ? AND product_id = ?').get(req.user.id, pid);
        if (existing) {
            const newQty = Math.min(existing.qty + qty, product.stock);
            db.prepare('UPDATE cart_items SET qty = ? WHERE id = ?').run(newQty, existing.id);
        } else {
            db.prepare('INSERT INTO cart_items (user_id, product_id, qty) VALUES (?, ?, ?)').run(req.user.id, pid, Math.min(qty, product.stock));
        }
        merged++;
    }
    res.json({ message: `Đã merge ${merged} sản phẩm vào giỏ hàng` });
});

module.exports = router;

