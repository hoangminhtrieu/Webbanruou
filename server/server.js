// VINOVA Backend — Máy chủ Express
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
const { initDB } = require("./config/database");

const app = express();

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const PORT = process.env.PORT || 5000;

initDB();

// Middleware bảo mật
app.use(
  helmet({
    contentSecurityPolicy: false, // Frontend được phục vụ riêng
  }),
);
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:5500", "null", "*"],
    credentials: true,
  }),
);

// Giới hạn tốc độ (Rate limiting)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 200,
  message: { error: "Quá nhiều request, vui lòng thử lại sau" },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Quá nhiều lần đăng nhập, vui lòng thử lại sau 15 phút" },
});
app.use("/api/", limiter);
app.use("/api/auth/", authLimiter);

// Bộ phân tích Body (Stripe webhook cần raw body)
app.use(
  "/api/payments/stripe/webhook",
  express.raw({ type: "application/json" }),
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Tệp tĩnh (phục vụ frontend) ───────────────────────────
app.use(express.static(path.join(__dirname, "../")));

// Tuyến đường API
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/users", require("./routes/users"));
app.use("/api/admin", require("./routes/admin"));

// ─── Health check ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    version: "1.0.0",
    service: "VINOVA Premium Wine & Spirits API",
    timestamp: new Date().toISOString(),
  });
});

// ─── Payment result page (redirect target) ───────────────────
app.get("/payment-result", (req, res) => {
  const { success, order_id } = req.query;
  res.send(`
    <html><head><meta charset="UTF-8"><title>Kết quả thanh toán</title>
    <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0d0a0e;color:#e8ddd4;text-align:center}</style></head>
    <body>
      <div>
        <div style="font-size:4rem">${success === "true" ? "🎉" : "❌"}</div>
        <h2>${success === "true" ? "Thanh toán thành công!" : "Thanh toán thất bại"}</h2>
        <p>Mã đơn hàng: #${order_id || "N/A"}</p>
        <a href="/" style="color:#c9a84c">← Về trang chủ</a>
      </div>
      <script>
        // Notify opener window if in popup
        if (window.opener) { window.opener.postMessage({type:'PAYMENT_RESULT',success:${success === "true"},orderId:'${order_id}'},'*'); window.close(); }
        setTimeout(()=>window.location.href='/',3000);
      </script>
    </body></html>
  `);
});

// ─── SPA fallback ─────────────────────────────────────────────
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "..", "index.html"));
  } else {
    res.status(404).json({ error: "API endpoint không tồn tại" });
  }
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error("[ERROR]", err.message);
  if (err.type === "entity.parse.failed")
    return res.status(400).json({ error: "JSON không hợp lệ" });
  res
    .status(err.status || 500)
    .json({ error: err.message || "Lỗi máy chủ nội bộ" });
});

// ─── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("");
  console.log("🍷  VINOVA Premium Wine & Spirits API");
  console.log(`🚀  Server running: http://localhost:${PORT}`);
  console.log(`📋  API Docs:`);
  console.log(`    POST   /api/auth/register`);
  console.log(`    POST   /api/auth/login`);
  console.log(`    GET    /api/products`);
  console.log(`    GET    /api/products/search?q=`);
  console.log(`    POST   /api/cart`);
  console.log(`    POST   /api/orders`);
  console.log(`    POST   /api/payments/vnpay/create`);
  console.log(`    POST   /api/payments/momo/create`);
  console.log(`    POST   /api/payments/stripe/create-intent`);
  console.log(`    GET    /api/admin/dashboard`);
  console.log("");
  console.log("💡  Để seed dữ liệu: node seeds/products.js");
  console.log("👤  Admin: admin@vinova.vn | Admin@123");
});
