// ============================================================
// Orders Routes — /api/orders
// ============================================================
const router = require('express').Router();
const { getDB, transaction, lastId } = require('../config/database');
const { authMiddleware, adminMiddleware, optionalAuth } = require('../middleware/auth');

// POST /api/orders — Create order from cart
router.post('/', optionalAuth, (req, res) => {
    const db = getDB();
    const { address, shipping_method, payment_method, gift_wrap, gift_message, adult_signature, guest_email, items } = req.body;
    if (!address || !payment_method) return res.status(400).json({ error: 'Thiếu thông tin địa chỉ hoặc phương thức thanh toán' });

    let orderItems = [];

    if (req.user) {
        // Logged in: get from server cart
        orderItems = db.prepare(`
      SELECT c.qty, p.id as product_id, p.name, p.price, p.img, p.volume, p.stock
      FROM cart_items c JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ? AND p.is_active = 1
    `).all(req.user.id);
    } else if (items?.length) {
        // Guest: items passed in body
        orderItems = items.map(i => {
            const p = db.prepare('SELECT id, name, price, img, volume, stock FROM products WHERE id = ? AND is_active = 1').get(i.product_id);
            return p ? { ...p, product_id: p.id, qty: Math.min(i.qty, p.stock) } : null;
        }).filter(Boolean);
    }

    if (!orderItems.length) return res.status(400).json({ error: 'Giỏ hàng trống' });

    const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping_fee = shipping_method === 'express' ? 50000 : (subtotal >= 5000000 ? 0 : 30000);
    const tax = Math.round(subtotal * 0.1);
    const gift_fee = gift_wrap ? 50000 : 0;
    const total = subtotal + shipping_fee + tax + gift_fee;

    const createOrder = transaction(db, () => {
        const orderResult = db.prepare(`
      INSERT INTO orders (user_id, guest_email, status, total, shipping_fee, tax, gift_wrap, gift_message, adult_signature, payment_method, shipping_method, address)
      VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            req.user?.id || null, guest_email || null, total, shipping_fee, tax,
            gift_wrap ? 1 : 0, gift_message || null, adult_signature !== false ? 1 : 0,
            payment_method, shipping_method || 'standard', JSON.stringify(address)
        );

        const orderId = lastId(orderResult);

        const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, product_img, qty, price_at_purchase, volume)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        const reduceStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?');

        for (const item of orderItems) {
            insertItem.run(orderId, item.product_id, item.name, item.img, item.qty, item.price, item.volume);
            reduceStock.run(item.qty, item.product_id, item.qty);
        }

        if (req.user) {
            db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
        }

        return orderId;
    });

    const orderId = createOrder();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);

    res.status(201).json({ message: 'Đặt hàng thành công', order_id: orderId, order, total });
});

// GET /api/orders — List my orders
router.get('/', authMiddleware, (req, res) => {
    const db = getDB();
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    orders.forEach(o => { try { o.address = JSON.parse(o.address); } catch { } });
    res.json({ orders });
});

// GET /api/orders/:id
router.get('/:id', authMiddleware, (req, res) => {
    const db = getDB();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    if (order.user_id && order.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Bạn không có quyền xem đơn hàng này' });
    }
    try { order.address = JSON.parse(order.address); } catch { }
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    const payment = db.prepare('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1').get(order.id);
    res.json({ order, items, payment });
});

// PUT /api/orders/:id/status — Admin update order status
router.put('/:id/status', authMiddleware, adminMiddleware, (req, res) => {
    const { status } = req.body;
    const valid = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled', 'refunded'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    const db = getDB();
    db.prepare('UPDATE orders SET status = ?, updated_at = datetime("now") WHERE id = ?').run(status, req.params.id);
    res.json({ message: `Đơn hàng chuyển sang: ${status}` });
});

// GET /api/orders/admin/all — Admin list all orders
router.get('/admin/all', authMiddleware, adminMiddleware, (req, res) => {
    const db = getDB();
    const { status, page = 1, limit = 20 } = req.query;
    let sql = 'SELECT o.*, u.full_name, u.email FROM orders o LEFT JOIN users u ON o.user_id = u.id';
    const params = [];
    if (status) { sql += ' WHERE o.status = ?'; params.push(status); }
    sql += ' ORDER BY o.created_at DESC';
    const total = db.prepare(sql.replace('SELECT o.*, u.full_name, u.email', 'SELECT COUNT(*) as count')).get(...params)?.count || 0;
    const offset = (page - 1) * limit;
    const orders = db.prepare(sql + ' LIMIT ? OFFSET ?').all(...params, +limit, offset);
    res.json({ orders, total, page: +page, limit: +limit });
});

module.exports = router;
