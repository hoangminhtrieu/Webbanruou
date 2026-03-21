// ============================================================
// Payments Routes — VNPay + MoMo + Stripe
// ============================================================
const router = require("express").Router();
const crypto = require("crypto");
const https = require("https");
const qs = require("qs");
const { getDB } = require("../config/database");
const Order = require("../models/Order");
const { authMiddleware, optionalAuth } = require("../middleware/auth");
const cfg = require("../config/payment");

// ─── VNPay ────────────────────────────────────────────────────
function sortObject(obj) {
  const sorted = {};
  Object.keys(obj)
    .sort()
    .forEach((k) => {
      sorted[k] = obj[k];
    });
  return sorted;
}

// POST /api/payments/vnpay/create
router.post("/vnpay/create", optionalAuth, (req, res) => {
  const { order_id } = req.body;
  if (!order_id) return res.status(400).json({ error: "Thiếu order_id" });

  const db = getDB();
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(order_id);
  if (!order) return res.status(404).json({ error: "Không tìm thấy đơn hàng" });

  const date = new Date();
  const createDate = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0"),
  ].join("");
  const expireDate = (() => {
    const e = new Date(date.getTime() + 15 * 60 * 1000);
    return [
      e.getFullYear(),
      String(e.getMonth() + 1).padStart(2, "0"),
      String(e.getDate()).padStart(2, "0"),
      String(e.getHours()).padStart(2, "0"),
      String(e.getMinutes()).padStart(2, "0"),
      String(e.getSeconds()).padStart(2, "0"),
    ].join("");
  })();

  const params = sortObject({
    vnp_Version: cfg.vnpay.version,
    vnp_Command: "pay",
    vnp_TmnCode: cfg.vnpay.tmnCode,
    vnp_Locale: cfg.vnpay.locale,
    vnp_CurrCode: cfg.vnpay.currCode,
    vnp_TxnRef: `${order_id}_${Date.now()}`,
    vnp_OrderInfo: `Thanh toan don hang #${order_id} VINOVA`,
    vnp_OrderType: cfg.vnpay.orderType,
    vnp_Amount: order.total * 100,
    vnp_ReturnUrl: cfg.vnpay.returnUrl,
    vnp_IpAddr: req.ip || "127.0.0.1",
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  });

  const signData = qs.stringify(params, { encode: false });
  const hmac = crypto.createHmac("sha512", cfg.vnpay.hashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  const payUrl = cfg.vnpay.url + "?" + signData + "&vnp_SecureHash=" + signed;

  // Record payment attempt
  db.prepare(
    `
    INSERT INTO payments (order_id, gateway, amount, status, raw_request)
    VALUES (?, 'vnpay', ?, 'pending', ?)
  `,
  ).run(order_id, order.total, JSON.stringify(params));

  res.json({ payment_url: payUrl, order_id });
});

// GET /api/payments/vnpay/return — User is redirected back
router.get("/vnpay/return", (req, res) => {
  const { vnp_SecureHash, vnp_TxnRef, vnp_ResponseCode, ...params } = req.query;
  const sorted = sortObject(params);
  const signData = qs.stringify(sorted, { encode: false });
  const hmac = crypto.createHmac("sha512", cfg.vnpay.hashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  const success = signed === vnp_SecureHash && vnp_ResponseCode === "00";
  const orderId = vnp_TxnRef?.split("_")[0];

  if (success && orderId) {
    Order.updateStatus(+orderId, "confirmed");
    const db = getDB();
    db.prepare(
      "UPDATE payments SET status = 'success', transaction_id = ?, paid_at = datetime('now'), raw_response = ? WHERE order_id = ? AND gateway = 'vnpay' AND status = 'pending'",
    ).run(vnp_TxnRef, JSON.stringify(req.query), +orderId);
  }

  // Redirect frontend với kết quả
  const frontendUrl = `http://localhost:3001/payment-result?success=${success}&order_id=${orderId || ""}`;
  res.redirect(frontendUrl);
});

// POST /api/payments/vnpay/ipn — VNPay server-to-server callback
router.post("/vnpay/ipn", (req, res) => {
  const {
    vnp_SecureHash,
    vnp_TxnRef,
    vnp_ResponseCode,
    vnp_Amount,
    ...params
  } = req.body;
  const sorted = sortObject(params);
  const signData = qs.stringify(sorted, { encode: false });
  const hmac = crypto.createHmac("sha512", cfg.vnpay.hashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  if (signed !== vnp_SecureHash)
    return res.json({ RspCode: "97", Message: "Fail checksum" });

  const orderId = vnp_TxnRef?.split("_")[0];
  const db = getDB();
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(+orderId);
  if (!order) return res.json({ RspCode: "01", Message: "Order not found" });
  if (order.total !== Math.round(+vnp_Amount / 100))
    return res.json({ RspCode: "04", Message: "Invalid amount" });

  if (vnp_ResponseCode === "00") {
    Order.updateStatus(+orderId, "confirmed");
    db.prepare(
      "UPDATE payments SET status = 'success', paid_at = datetime('now') WHERE order_id = ? AND gateway = 'vnpay' AND status = 'pending'",
    ).run(+orderId);
  }
  res.json({ RspCode: "00", Message: "Confirm Success" });
});

// ─── MoMo ────────────────────────────────────────────────────
router.post("/momo/create", optionalAuth, async (req, res) => {
  const { order_id } = req.body;
  if (!order_id) return res.status(400).json({ error: "Thiếu order_id" });

  const db = getDB();
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(order_id);
  if (!order) return res.status(404).json({ error: "Không tìm thấy đơn hàng" });

  const requestId = `${cfg.momo.partnerCode}${Date.now()}`;
  const orderId_m = `VINOVA_${order_id}_${Date.now()}`;
  const amount = String(order.total);
  const orderInfo = `Thanh toan don hang #${order_id} VINOVA`;
  const extraData = "";

  const rawSignature = [
    `accessKey=${cfg.momo.accessKey}`,
    `amount=${amount}`,
    `extraData=${extraData}`,
    `ipnUrl=${cfg.momo.notifyUrl}`,
    `orderId=${orderId_m}`,
    `orderInfo=${orderInfo}`,
    `partnerCode=${cfg.momo.partnerCode}`,
    `redirectUrl=${cfg.momo.returnUrl}`,
    `requestId=${requestId}`,
    `requestType=${cfg.momo.requestType}`,
  ].join("&");

  const signature = crypto
    .createHmac("sha256", cfg.momo.secretKey)
    .update(rawSignature)
    .digest("hex");

  const body = JSON.stringify({
    partnerCode: cfg.momo.partnerCode,
    partnerName: "VINOVA",
    storeId: "VINOVAStore",
    requestId,
    amount,
    orderId: orderId_m,
    orderInfo,
    redirectUrl: cfg.momo.returnUrl,
    ipnUrl: cfg.momo.notifyUrl,
    lang: "vi",
    extraData,
    requestType: cfg.momo.requestType,
    signature,
  });

  try {
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: "test-payment.momo.vn",
        port: 443,
        path: "/v2/gateway/api/create",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      };
      const momoReq = https.request(options, (momoRes) => {
        let data = "";
        momoRes.on("data", (c) => (data += c));
        momoRes.on("end", () => resolve(JSON.parse(data)));
      });
      momoReq.on("error", reject);
      momoReq.write(body);
      momoReq.end();
    });

    db.prepare(
      `INSERT INTO payments (order_id, gateway, gateway_ref, amount, status, raw_response) VALUES (?, 'momo', ?, ?, 'pending', ?)`,
    ).run(order_id, orderId_m, order.total, JSON.stringify(result));

    res.json({
      payment_url: result.payUrl,
      deep_link: result.deeplink,
      qr_code: result.qrCodeUrl,
    });
  } catch (err) {
    res.status(500).json({ error: "Lỗi kết nối MoMo", detail: err.message });
  }
});

// POST /api/payments/momo/callback (IPN)
router.post("/momo/callback", (req, res) => {
  const { orderId, resultCode, transId } = req.body;
  if (resultCode === 0) {
    const orderNum = orderId?.split("_")[1];
    Order.updateStatus(+orderNum, "confirmed");
    const db = getDB();
    db.prepare(
      "UPDATE payments SET status = 'success', transaction_id = ?, paid_at = datetime('now') WHERE gateway_ref = ?",
    ).run(String(transId), orderId);
  }
  res.json({ message: "OK" });
});

// ─── Stripe ──────────────────────────────────────────────────
let stripe;
try {
  stripe = require("stripe")(cfg.stripe.secretKey);
} catch {}

router.post("/stripe/create-intent", optionalAuth, async (req, res) => {
  if (!stripe)
    return res.status(503).json({
      error:
        "Stripe chưa được cấu hình. Vui lòng thêm STRIPE_SECRET_KEY vào .env",
    });
  const { order_id } = req.body;
  const db = getDB();
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(order_id);
  if (!order) return res.status(404).json({ error: "Không tìm thấy đơn hàng" });

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.total,
      currency: cfg.stripe.currency,
      metadata: { order_id: String(order_id), source: "VINOVA" },
    });
    db.prepare(
      `INSERT INTO payments (order_id, gateway, gateway_ref, amount, status) VALUES (?, 'stripe', ?, ?, 'pending')`,
    ).run(order_id, paymentIntent.id, order.total);
    res.json({
      client_secret: paymentIntent.client_secret,
      publishable_key: cfg.stripe.publishableKey,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/stripe/webhook
router.post(
  "/stripe/webhook",
  require("express").raw({ type: "application/json" }),
  async (req, res) => {
    if (!stripe) return res.sendStatus(400);
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        cfg.stripe.webhookSecret,
      );
    } catch {
      return res.sendStatus(400);
    }

    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object;
      const orderId = pi.metadata?.order_id;
      if (orderId) {
        Order.updateStatus(+orderId, "confirmed");
        const db = getDB();
        db.prepare(
          "UPDATE payments SET status = 'success', transaction_id = ?, paid_at = datetime('now') WHERE gateway_ref = ?",
        ).run(pi.id, pi.id);
      }
    }
    res.json({ received: true });
  },
);

// GET /api/payments/status/:order_id
router.get("/status/:order_id", optionalAuth, (req, res) => {
  const db = getDB();
  const payment = db
    .prepare(
      "SELECT gateway, status, paid_at, transaction_id FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1",
    )
    .get(req.params.order_id);
  const order = db
    .prepare("SELECT status FROM orders WHERE id = ?")
    .get(req.params.order_id);
  res.json({ payment, order_status: order?.status });
});

module.exports = router;
