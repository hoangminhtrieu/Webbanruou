// ============================================================
// Products Routes — /api/products
// ============================================================
const router = require("express").Router();
const { getDB } = require("../config/database");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const {
  validateProductFilter,
  validateProductCreate,
  validateId,
  validateReview,
} = require("../middleware/validate");

// Helper: Parse JSON fields for a product object
const parseJSONFields = (p) => {
  if (!p) return p;
  ["tasting_notes", "food_pairing", "tags"].forEach((field) => {
    try {
      if (typeof p[field] === "string") p[field] = JSON.parse(p[field]);
    } catch {
      p[field] = field === "tasting_notes" ? {} : [];
    }
  });
  return p;
};

// GET /api/products/filter-counts
router.get("/filter-counts", (req, res) => {
  const db = getDB();
  try {
    const types = db
      .prepare(
        `
            SELECT type, COUNT(*) as count 
            FROM products 
            WHERE is_active = 1 
            GROUP BY type
        `,
      )
      .all();

    const regions = db
      .prepare(
        `
            SELECT region, COUNT(*) as count 
            FROM products 
            WHERE is_active = 1 
            GROUP BY region
        `,
      )
      .all();

    // Convert to objects for easier frontend mapping
    const typeCounts = {};
    types.forEach((t) => (typeCounts[t.type] = t.count));

    const regionCounts = {};
    regions.forEach((r) => (regionCounts[r.region] = r.count));

    res.json({ types: typeCounts, regions: regionCounts });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy số liệu bộ lọc" });
  }
});

// GET /api/products
router.get("/", validateProductFilter, (req, res) => {
  const db = getDB();
  let sql = "SELECT * FROM products WHERE is_active = 1";
  const params = [];

  if (req.query.type) {
    sql += " AND type = ?";
    params.push(req.query.type);
  }
  if (req.query.region) {
    sql += " AND region = ?";
    params.push(req.query.region);
  }
  if (req.query.min_price) {
    sql += " AND price >= ?";
    params.push(+req.query.min_price);
  }
  if (req.query.max_price) {
    sql += " AND price <= ?";
    params.push(+req.query.max_price);
  }
  if (req.query.min_score) {
    sql += " AND score >= ?";
    params.push(+req.query.min_score);
  }

  const sortMap = {
    "price-asc": "price ASC",
    "price-desc": "price DESC",
    rating: "rating DESC",
    newest: "vintage DESC",
    popular: "reviews_count DESC",
    "id-asc": "id ASC",
    "id-desc": "id DESC",
  };
  sql += " ORDER BY " + (sortMap[req.query.sort] || "reviews_count DESC");

  const page = Math.max(1, +req.query.page || 1);
  const limit = Math.min(1000, +req.query.limit || 20);
  const offset = (page - 1) * limit;

  const total =
    db
      .prepare(sql.replace("SELECT *", "SELECT COUNT(*) as count"))
      .get(...params)?.count || 0;
  const products = db
    .prepare(sql + " LIMIT ? OFFSET ?")
    .all(...params, limit, offset);

  products.forEach(parseJSONFields);

  res.json({ products, total, page, limit, pages: Math.ceil(total / limit) });
});

// GET /api/products/search
router.get("/search", (req, res) => {
  const q = (req.query.q || "").toLowerCase();
  if (!q) return res.json({ products: [] });
  const db = getDB();
  const products = db
    .prepare(
      `
    SELECT id, name, region, price, img, rating, type FROM products
    WHERE is_active = 1 AND (
      LOWER(name) LIKE '%' || ? || '%' OR
      LOWER(region) LIKE '%' || ? || '%' OR
      LOWER(grape) LIKE '%' || ? || '%'
    ) LIMIT 8
  `,
    )
    .all(q, q, q);
  res.json({ products });
});

// GET /api/products/:id
router.get("/:id", (req, res) => {
  const db = getDB();
  const p = db
    .prepare("SELECT * FROM products WHERE id = ? AND is_active = 1")
    .get(req.params.id);
  if (!p) return res.status(404).json({ error: "Sản phẩm không tồn tại" });
  parseJSONFields(p);

  const reviews = db
    .prepare(
      `
    SELECT r.*, u.full_name FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ? ORDER BY r.created_at DESC LIMIT 10
  `,
    )
    .all(req.params.id);

  res.json({ product: p, reviews });
});

// POST /api/products — Admin only
router.post("/", authMiddleware, adminMiddleware, (req, res) => {
  const db = getDB();
  const {
    name,
    region,
    subregion,
    type,
    grape,
    abv,
    volume,
    price,
    old_price,
    stock,
    score,
    vintage,
    badge,
    img,
    description,
    tasting_notes,
    food_pairing,
    tags,
  } = req.body;
  if (!name || !region || !type || !price)
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
  const result = db
    .prepare(
      `
    INSERT INTO products (name,region,subregion,type,grape,abv,volume,price,old_price,stock,score,vintage,badge,img,description,tasting_notes,food_pairing,tags)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `,
    )
    .run(
      name,
      region,
      subregion || null,
      type,
      grape || null,
      abv || null,
      volume || "750ml",
      price,
      old_price || null,
      stock || 0,
      score || null,
      vintage || null,
      badge || null,
      img || null,
      description || null,
      JSON.stringify(tasting_notes || {}),
      JSON.stringify(food_pairing || []),
      JSON.stringify(tags || []),
    );
  res
    .status(201)
    .json({ message: "Thêm sản phẩm thành công", id: result.lastInsertRowid });
});

// PUT /api/products/:id — Admin only
router.put("/:id", authMiddleware, adminMiddleware, (req, res) => {
  const db = getDB();
  const p = db
    .prepare("SELECT id FROM products WHERE id = ?")
    .get(req.params.id);
  if (!p) return res.status(404).json({ error: "Sản phẩm không tồn tại" });
  const fields = [
    "name",
    "region",
    "subregion",
    "type",
    "grape",
    "abv",
    "volume",
    "price",
    "old_price",
    "stock",
    "score",
    "vintage",
    "badge",
    "img",
    "description",
    "is_active",
  ];
  const updates = [];
  const vals = [];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      vals.push(req.body[f]);
    }
  });
  if (!updates.length)
    return res.status(400).json({ error: "Không có trường nào cần update" });
  vals.push(req.params.id);
  db.prepare(`UPDATE products SET ${updates.join(", ")} WHERE id = ?`).run(
    ...vals,
  );
  res.json({ message: "Cập nhật thành công" });
});

// DELETE /api/products/:id — Admin soft delete
router.delete("/:id", authMiddleware, adminMiddleware, (req, res) => {
  const db = getDB();
  db.prepare("UPDATE products SET is_active = 0 WHERE id = ?").run(
    req.params.id,
  );
  res.json({ message: "Đã ẩn sản phẩm" });
});

// POST /api/products/:id/reviews — Add review (yêu cầu đăng nhập)
router.post("/:id/reviews", authMiddleware, validateReview, (req, res) => {
  const db = getDB();
  const productId = +req.params.id;
  const { rating, comment } = req.body;
  const product = db
    .prepare("SELECT id FROM products WHERE id = ? AND is_active = 1")
    .get(productId);
  if (!product)
    return res.status(404).json({ error: "Sản phẩm không tồn tại" });
  try {
    db.prepare(
      "INSERT OR REPLACE INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)",
    ).run(productId, req.user.id, rating, comment || null);
    const avg = db
      .prepare(
        "SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE product_id = ?",
      )
      .get(productId);
    db.prepare(
      "UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?",
    ).run(Math.round(avg.avg * 10) / 10, avg.cnt, productId);
    res.status(201).json({ message: "Đánh giá của bạn đã được ghi nhận!" });
  } catch {
    res.status(409).json({ error: "Bạn đã đánh giá sản phẩm này rồi" });
  }
});

// GET /api/products/:id/reviews
router.get("/:id/reviews", (req, res) => {
  const db = getDB();
  const page = Math.max(1, +req.query.page || 1);
  const limit = 10;
  const offset = (page - 1) * limit;
  const reviews = db
    .prepare(
      `
        SELECT r.id, r.rating, r.comment, r.created_at, u.full_name, u.tier
        FROM reviews r JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC LIMIT ? OFFSET ?
    `,
    )
    .all(req.params.id, limit, offset);
  const total =
    db
      .prepare("SELECT COUNT(*) as cnt FROM reviews WHERE product_id = ?")
      .get(req.params.id)?.cnt || 0;
  res.json({ reviews, total, page, pages: Math.ceil(total / limit) });
});

module.exports = router;
