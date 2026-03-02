// ============================================================
// Model: User
// ============================================================
const { getDB, lastId } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {
    // Tìm user theo email
    findByEmail(email) {
        const db = getDB();
        return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    },

    // Tìm user theo ID
    findById(id) {
        const db = getDB();
        return db.prepare('SELECT id, email, full_name, phone, role, tier, points, is_active, created_at FROM users WHERE id = ?').get(id);
    },

    // Tạo user mới
    create({ email, password, full_name, phone = null, role = 'customer' }) {
        const db = getDB();
        const hash = bcrypt.hashSync(password, 10);
        const stmt = db.prepare(
            'INSERT INTO users (email, password, full_name, phone, role) VALUES (?, ?, ?, ?, ?)'
        );
        const result = stmt.run(email, hash, full_name, phone, role);
        return lastId(result);
    },

    // Xác thực mật khẩu
    verifyPassword(plainText, hash) {
        return bcrypt.compareSync(plainText, hash);
    },

    // Cập nhật profile
    update(id, { full_name, phone }) {
        const db = getDB();
        const stmt = db.prepare(
            "UPDATE users SET full_name = ?, phone = ?, updated_at = datetime('now') WHERE id = ?"
        );
        return stmt.run(full_name, phone, id);
    },

    // Cộng điểm
    addPoints(id, points) {
        const db = getDB();
        const stmt = db.prepare('UPDATE users SET points = points + ? WHERE id = ?');
        return stmt.run(points, id);
    },

    // Cập nhật tier (silver/gold/platinum)
    updateTier(id, tier) {
        const db = getDB();
        return db.prepare('UPDATE users SET tier = ? WHERE id = ?').run(tier, id);
    },

    // Lấy danh sách tất cả users (cho admin)
    findAll({ limit = 50, offset = 0 } = {}) {
        const db = getDB();
        return db.prepare(
            'SELECT id, email, full_name, phone, role, tier, points, is_active, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?'
        ).all(limit, offset);
    },

    // Vô hiệu hóa tài khoản
    deactivate(id) {
        const db = getDB();
        return db.prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(id);
    },

    // Đếm tổng số user
    count() {
        const db = getDB();
        return db.prepare('SELECT COUNT(*) as total FROM users WHERE role = ?').get('customer').total;
    },

    // Wishlist
    getWishlist(userId) {
        const db = getDB();
        return db.prepare(`
            SELECT p.id, p.name, p.price, p.old_price, p.img, p.type, p.region, p.rating, p.stock
            FROM wishlists w
            JOIN products p ON p.id = w.product_id
            WHERE w.user_id = ?
        `).all(userId);
    },

    addToWishlist(userId, productId) {
        const db = getDB();
        try {
            db.prepare('INSERT OR IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)').run(userId, productId);
            return true;
        } catch { return false; }
    },

    removeFromWishlist(userId, productId) {
        const db = getDB();
        db.prepare('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?').run(userId, productId);
    },
};

module.exports = User;
