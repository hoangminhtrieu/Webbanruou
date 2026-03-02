// ============================================================
// Model: Order
// ============================================================
const { getDB, lastId, transaction } = require('../config/database');

const Order = {
    // Tạo đơn hàng mới (kèm các order items)
    create({ userId, guestEmail, items, total, shippingFee, tax, giftWrap, giftMessage, adultSignature, paymentMethod, shippingMethod, address, note }) {
        const db = getDB();
        const createFn = transaction(db, () => {
            // Tạo order
            const orderResult = db.prepare(`
                INSERT INTO orders (user_id, guest_email, total, shipping_fee, tax, gift_wrap, gift_message, adult_signature, payment_method, shipping_method, address, note)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                userId || null, guestEmail || null,
                total, shippingFee || 50000, tax || 0,
                giftWrap ? 1 : 0, giftMessage || null,
                adultSignature ? 1 : 0,
                paymentMethod, shippingMethod || 'standard',
                JSON.stringify(address), note || null
            );
            const orderId = lastId(orderResult);

            // Tạo order items
            const insertItem = db.prepare(`
                INSERT INTO order_items (order_id, product_id, product_name, product_img, qty, price_at_purchase, volume)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
            for (const item of items) {
                insertItem.run(orderId, item.productId, item.name, item.img, item.qty, item.price, item.volume || '750ml');
                // Trừ stock
                db.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?').run(item.qty, item.productId);
            }

            return orderId;
        });
        return createFn();
    },

    // Lấy chi tiết đơn hàng
    findById(id) {
        const db = getDB();
        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
        if (!order) return null;

        order.items = db.prepare(`
            SELECT oi.*, p.img as current_img
            FROM order_items oi
            LEFT JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = ?
        `).all(id);

        order.payment = db.prepare('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1').get(id);

        try { order.address = JSON.parse(order.address || '{}'); } catch { order.address = {}; }
        return order;
    },

    // Lấy danh sách đơn hàng của user
    findByUserId(userId, { limit = 20, offset = 0 } = {}) {
        const db = getDB();
        const orders = db.prepare(`
            SELECT o.*, 
                GROUP_CONCAT(oi.product_name, ', ') as item_names,
                SUM(oi.qty) as total_qty
            FROM orders o
            LEFT JOIN order_items oi ON oi.order_id = o.id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
            LIMIT ? OFFSET ?
        `).all(userId, limit, offset);
        return orders;
    },

    // Lấy toàn bộ đơn hàng (admin)
    findAll({ status, limit = 50, offset = 0 } = {}) {
        const db = getDB();
        const conditions = ['1=1'];
        const params = [];
        if (status) { conditions.push('o.status = ?'); params.push(status); }

        return db.prepare(`
            SELECT o.*, u.full_name as customer_name, u.email as customer_email,
                COUNT(oi.id) as item_count, SUM(oi.qty) as total_qty
            FROM orders o
            LEFT JOIN users u ON u.id = o.user_id
            LEFT JOIN order_items oi ON oi.order_id = o.id
            WHERE ${conditions.join(' AND ')}
            GROUP BY o.id
            ORDER BY o.created_at DESC
            LIMIT ? OFFSET ?
        `).all(...params, limit, offset);
    },

    // Cập nhật trạng thái đơn hàng
    updateStatus(id, status) {
        const db = getDB();
        return db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
    },

    // Đếm đơn hàng
    count({ status } = {}) {
        const db = getDB();
        if (status) {
            return db.prepare('SELECT COUNT(*) as total FROM orders WHERE status = ?').get(status).total;
        }
        return db.prepare('SELECT COUNT(*) as total FROM orders').get().total;
    },

    // Tổng doanh thu
    totalRevenue({ startDate, endDate } = {}) {
        const db = getDB();
        const conditions = ["status IN ('completed', 'shipping')"];
        const params = [];
        if (startDate) { conditions.push('created_at >= ?'); params.push(startDate); }
        if (endDate) { conditions.push('created_at <= ?'); params.push(endDate); }
        const result = db.prepare(`SELECT SUM(total) as revenue FROM orders WHERE ${conditions.join(' AND ')}`).get(...params);
        return result.revenue || 0;
    },

    // Doanh thu theo tháng (12 tháng gần nhất)
    revenueByMonth() {
        const db = getDB();
        return db.prepare(`
            SELECT strftime('%Y-%m', created_at) as month,
                SUM(total) as revenue,
                COUNT(*) as orders
            FROM orders
            WHERE status IN ('completed', 'shipping')
                AND created_at >= date('now', '-12 months')
            GROUP BY month
            ORDER BY month ASC
        `).all();
    },
};

module.exports = Order;
