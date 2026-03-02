// ============================================================
// Model: Product
// ============================================================
const { getDB, lastId } = require('../config/database');

const Product = {
    // Lấy danh sách sản phẩm với filter + sort + pagination
    findAll({ type, region, minPrice, maxPrice, minScore, vintage, sort = 'popular', limit = 20, offset = 0 } = {}) {
        const db = getDB();
        const conditions = ['p.is_active = 1'];
        const params = [];

        if (type) { conditions.push('p.type = ?'); params.push(type); }
        if (region) { conditions.push('p.region = ?'); params.push(region); }
        if (minPrice) { conditions.push('p.price >= ?'); params.push(Number(minPrice)); }
        if (maxPrice) { conditions.push('p.price <= ?'); params.push(Number(maxPrice)); }
        if (minScore) { conditions.push('p.score >= ?'); params.push(Number(minScore)); }
        if (vintage) { conditions.push('p.vintage = ?'); params.push(Number(vintage)); }

        const orderMap = {
            popular: 'p.reviews_count DESC, p.rating DESC',
            price_asc: 'p.price ASC',
            price_desc: 'p.price DESC',
            rating: 'p.rating DESC',
            newest: 'p.created_at DESC',
        };
        const orderBy = orderMap[sort] || orderMap.popular;

        const sql = `
            SELECT p.*, 
                COALESCE(AVG(r.rating), p.rating) as avg_rating,
                COUNT(r.id) as review_count
            FROM products p
            LEFT JOIN reviews r ON r.product_id = p.id
            WHERE ${conditions.join(' AND ')}
            GROUP BY p.id
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `;
        params.push(limit, offset);
        return db.prepare(sql).all(...params);
    },

    // Đếm số sản phẩm theo filter
    count({ type, region, minPrice, maxPrice, minScore, vintage } = {}) {
        const db = getDB();
        const conditions = ['is_active = 1'];
        const params = [];

        if (type) { conditions.push('type = ?'); params.push(type); }
        if (region) { conditions.push('region = ?'); params.push(region); }
        if (minPrice) { conditions.push('price >= ?'); params.push(Number(minPrice)); }
        if (maxPrice) { conditions.push('price <= ?'); params.push(Number(maxPrice)); }
        if (minScore) { conditions.push('score >= ?'); params.push(Number(minScore)); }
        if (vintage) { conditions.push('vintage = ?'); params.push(Number(vintage)); }

        const result = db.prepare(`SELECT COUNT(*) as total FROM products WHERE ${conditions.join(' AND ')}`).get(...params);
        return result.total;
    },

    // Lấy chi tiết 1 sản phẩm
    findById(id) {
        const db = getDB();
        const product = db.prepare(`
            SELECT p.*,
                COALESCE(AVG(r.rating), p.rating) as avg_rating,
                COUNT(r.id) as review_count
            FROM products p
            LEFT JOIN reviews r ON r.product_id = p.id
            WHERE p.id = ? AND p.is_active = 1
            GROUP BY p.id
        `).get(id);
        if (!product) return null;

        // Parse JSON fields
        try { product.tasting_notes = JSON.parse(product.tasting_notes || '[]'); } catch { product.tasting_notes = []; }
        try { product.food_pairing = JSON.parse(product.food_pairing || '[]'); } catch { product.food_pairing = []; }
        try { product.tags = JSON.parse(product.tags || '[]'); } catch { product.tags = []; }
        return product;
    },

    // Tìm kiếm theo từ khóa
    search(q, { limit = 20 } = {}) {
        const db = getDB();
        const like = `%${q}%`;
        return db.prepare(`
            SELECT id, name, region, type, price, img, rating, stock, vintage
            FROM products
            WHERE is_active = 1 AND (name LIKE ? OR region LIKE ? OR type LIKE ? OR grape LIKE ?)
            ORDER BY reviews_count DESC
            LIMIT ?
        `).all(like, like, like, like, limit);
    },

    // Sản phẩm nổi bật (homepage)
    getFeatured(limit = 8) {
        const db = getDB();
        return db.prepare(`
            SELECT * FROM products 
            WHERE is_active = 1 
            ORDER BY score DESC, rating DESC 
            LIMIT ?
        `).all(limit);
    },

    // ─── Admin CRUD ────────────────────────────────────────────
    create(data) {
        const db = getDB();
        const { name, region, subregion, type, grape, abv, volume, price, old_price, stock, score, vintage, badge, img, description, tasting_notes, food_pairing, tags } = data;
        const stmt = db.prepare(`
            INSERT INTO products (name, region, subregion, type, grape, abv, volume, price, old_price, stock, score, vintage, badge, img, description, tasting_notes, food_pairing, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            name, region, subregion, type, grape, abv, volume || '750ml',
            price, old_price, stock || 0, score, vintage, badge, img, description,
            JSON.stringify(tasting_notes || []), JSON.stringify(food_pairing || []), JSON.stringify(tags || [])
        );
        return lastId(result);
    },

    update(id, data) {
        const db = getDB();
        const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
        const values = Object.values(data);
        return db.prepare(`UPDATE products SET ${fields} WHERE id = ?`).run(...values, id);
    },

    updateStock(id, delta) {
        const db = getDB();
        return db.prepare('UPDATE products SET stock = MAX(0, stock + ?) WHERE id = ?').run(delta, id);
    },

    delete(id) {
        const db = getDB();
        return db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(id);
    },

    // Lấy đánh giá của sản phẩm
    getReviews(productId, { limit = 10, offset = 0 } = {}) {
        const db = getDB();
        return db.prepare(`
            SELECT r.*, u.full_name, u.tier
            FROM reviews r
            JOIN users u ON u.id = r.user_id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC
            LIMIT ? OFFSET ?
        `).all(productId, limit, offset);
    },

    // Thêm đánh giá
    addReview(productId, userId, { rating, comment }) {
        const db = getDB();
        try {
            const result = db.prepare(
                'INSERT OR REPLACE INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)'
            ).run(productId, userId, rating, comment);
            // Cập nhật rating trung bình
            const avg = db.prepare('SELECT AVG(rating) as avg FROM reviews WHERE product_id = ?').get(productId);
            db.prepare('UPDATE products SET rating = ?, reviews_count = reviews_count + 1 WHERE id = ?').run(
                Math.round(avg.avg * 10) / 10, productId
            );
            return lastId(result);
        } catch (e) {
            throw new Error('Bạn đã đánh giá sản phẩm này rồi');
        }
    },
};

module.exports = Product;
