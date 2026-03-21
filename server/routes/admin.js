// ============================================================
// Admin Routes — /api/admin
// ============================================================
const router = require("express").Router();
const { getDB } = require("../config/database");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/dashboard — KPI stats
router.get("/dashboard", (req, res) => {
  const db = getDB();
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastMonth =
    now.getMonth() === 0
      ? `${now.getFullYear() - 1}-12`
      : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}`;

  const revenue = db
    .prepare(
      `SELECT COALESCE(SUM(total),0) as val FROM orders WHERE status != 'cancelled' AND strftime('%Y-%m', created_at) = ?`,
    )
    .get(thisMonth);
  const revLast = db
    .prepare(
      `SELECT COALESCE(SUM(total),0) as val FROM orders WHERE status != 'cancelled' AND strftime('%Y-%m', created_at) = ?`,
    )
    .get(lastMonth);
  const orders = db
    .prepare(
      `SELECT COUNT(*) as val FROM orders WHERE strftime('%Y-%m', created_at) = ?`,
    )
    .get(thisMonth);
  const ordersLast = db
    .prepare(
      `SELECT COUNT(*) as val FROM orders WHERE strftime('%Y-%m', created_at) = ?`,
    )
    .get(lastMonth);
  const newCustomers = db
    .prepare(
      `SELECT COUNT(*) as val FROM users WHERE role = 'customer' AND strftime('%Y-%m', created_at) = ?`,
    )
    .get(thisMonth);
  const aov = orders.val > 0 ? Math.round(revenue.val / orders.val) : 0;

  // Monthly revenue for chart (12 months)
  const monthlyRevenue = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const row = db
      .prepare(
        `SELECT COALESCE(SUM(total),0) as val FROM orders WHERE status != 'cancelled' AND strftime('%Y-%m', created_at) = ?`,
      )
      .get(month);
    monthlyRevenue.push({
      month: `T${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`,
      revenue: row.val,
    });
  }

  // Order status breakdown
  const statusBreakdown = db
    .prepare(`SELECT status, COUNT(*) as count FROM orders GROUP BY status`)
    .all();

  // Top products
  const topProducts = db
    .prepare(
      `
    SELECT p.name, SUM(oi.qty) as sold, SUM(oi.qty * oi.price_at_purchase) as revenue
    FROM order_items oi JOIN products p ON oi.product_id = p.id
    GROUP BY oi.product_id ORDER BY sold DESC LIMIT 5
  `,
    )
    .all();

  // Type breakdown
  const typeBreakdown = db
    .prepare(
      `
    SELECT p.type, SUM(oi.qty * oi.price_at_purchase) as revenue
    FROM order_items oi JOIN products p ON oi.product_id = p.id
    GROUP BY p.type ORDER BY revenue DESC
  `,
    )
    .all();

  const pctChange = (a, b) => (b > 0 ? Math.round(((a - b) / b) * 100) : 0);

  res.json({
    kpi: {
      revenue: {
        value: revenue.val,
        change: pctChange(revenue.val, revLast.val),
      },
      orders: {
        value: orders.val,
        change: pctChange(orders.val, ordersLast.val),
      },
      new_customers: { value: newCustomers.val },
      aov: { value: aov },
    },
    monthly_revenue: monthlyRevenue,
    status_breakdown: statusBreakdown,
    top_products: topProducts,
    type_breakdown: typeBreakdown,
  });
});

// GET /api/admin/users — List users
router.get("/users", (req, res) => {
  const db = getDB();
  const { page = 1, limit = 20, search } = req.query;
  let sql =
    "SELECT id, email, full_name, phone, role, tier, points, is_active, created_at FROM users WHERE 1=1";
  const params = [];
  if (search) {
    sql += " AND (LOWER(email) LIKE ? OR LOWER(full_name) LIKE ?)";
    params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
  }
  sql += " ORDER BY created_at DESC";
  const total =
    db
      .prepare(
        sql.replace(
          "SELECT id, email, full_name, phone, role, tier, points, is_active, created_at",
          "SELECT COUNT(*) as count",
        ),
      )
      .get(...params)?.count || 0;
  const users = db
    .prepare(sql + " LIMIT ? OFFSET ?")
    .all(...params, +limit, (+page - 1) * +limit);
  res.json({ users, total, page: +page });
});

// PUT /api/admin/users/:id
router.put("/users/:id", (req, res) => {
  const { role, tier, is_active, points } = req.body;
  const db = getDB();
  const updates = [];
  const vals = [];
  if (role !== undefined) {
    updates.push("role = ?");
    vals.push(role);
  }
  if (tier !== undefined) {
    updates.push("tier = ?");
    vals.push(tier);
  }
  if (is_active !== undefined) {
    updates.push("is_active = ?");
    vals.push(is_active ? 1 : 0);
  }
  if (points !== undefined) {
    updates.push("points = ?");
    vals.push(+points);
  }
  if (!updates.length)
    return res.status(400).json({ error: "Không có gì để cập nhật" });
  vals.push(req.params.id);
  db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(
    ...vals,
  );
  res.json({ message: "Đã cập nhật người dùng" });
});

// GET /api/admin/inventory — Low stock products
router.get("/inventory", (req, res) => {
  const db = getDB();
  const lowStock = db
    .prepare(
      "SELECT id, name, stock, type, region FROM products WHERE is_active = 1 ORDER BY stock ASC LIMIT 20",
    )
    .all();
  const totalValue = db
    .prepare(
      "SELECT COALESCE(SUM(price * stock), 0) as val FROM products WHERE is_active = 1",
    )
    .get();
  res.json({ low_stock: lowStock, inventory_value: totalValue.val });
});

module.exports = router;
