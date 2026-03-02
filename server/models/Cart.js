// ============================================================
// Model: Cart
// ============================================================
const { getDB } = require('../config/database');

const Cart = {
    // Lấy giỏ hàng của user (kèm thông tin sản phẩm)
    getByUserId(userId) {
        const db = getDB();
        return db.prepare(`
            SELECT 
                ci.id, ci.product_id, ci.qty,
                p.name, p.price, p.old_price, p.img, p.stock,
                p.type, p.region, p.volume, p.is_active
            FROM cart_items ci
            JOIN products p ON p.id = ci.product_id
            WHERE ci.user_id = ?
            ORDER BY ci.created_at DESC
        `).all(userId);
    },

    // Thêm hoặc tăng số lượng
    addItem(userId, productId, qty = 1) {
        const db = getDB();
        // Kiểm tra sản phẩm có tồn tại và còn hàng không
        const product = db.prepare('SELECT id, stock FROM products WHERE id = ? AND is_active = 1').get(productId);
        if (!product) throw new Error('Sản phẩm không tồn tại');

        const existing = db.prepare('SELECT id, qty FROM cart_items WHERE user_id = ? AND product_id = ?').get(userId, productId);
        if (existing) {
            const newQty = Math.min(existing.qty + qty, product.stock);
            db.prepare('UPDATE cart_items SET qty = ? WHERE id = ?').run(newQty, existing.id);
        } else {
            const safeQty = Math.min(qty, product.stock);
            db.prepare('INSERT INTO cart_items (user_id, product_id, qty) VALUES (?, ?, ?)').run(userId, productId, safeQty);
        }
    },

    // Cập nhật số lượng
    updateQty(userId, productId, qty) {
        const db = getDB();
        if (qty <= 0) {
            return Cart.removeItem(userId, productId);
        }
        const product = db.prepare('SELECT stock FROM products WHERE id = ?').get(productId);
        const safeQty = product ? Math.min(qty, product.stock) : qty;
        return db.prepare('UPDATE cart_items SET qty = ? WHERE user_id = ? AND product_id = ?').run(safeQty, userId, productId);
    },

    // Xóa 1 item
    removeItem(userId, productId) {
        const db = getDB();
        return db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(userId, productId);
    },

    // Xóa toàn bộ giỏ hàng (sau khi thanh toán)
    clear(userId) {
        const db = getDB();
        return db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
    },

    // Đếm số items
    count(userId) {
        const db = getDB();
        const result = db.prepare('SELECT SUM(qty) as total FROM cart_items WHERE user_id = ?').get(userId);
        return result.total || 0;
    },

    // Tính tổng tiền
    getTotal(userId) {
        const db = getDB();
        const result = db.prepare(`
            SELECT SUM(ci.qty * p.price) as subtotal
            FROM cart_items ci
            JOIN products p ON p.id = ci.product_id
            WHERE ci.user_id = ?
        `).get(userId);
        return result.subtotal || 0;
    },

    // Merge cart từ localStorage khi login
    merge(userId, localItems = []) {
        for (const item of localItems) {
            try {
                Cart.addItem(userId, item.productId, item.qty);
            } catch { /* bỏ qua sản phẩm lỗi */ }
        }
    },
};

module.exports = Cart;
