// ============================================================
// Model: Payment
// ============================================================
const { getDB, lastId } = require("../config/database");

const Payment = {
  // Tạo bản ghi payment
  create({
    orderId,
    gateway,
    amount,
    transactionId = null,
    rawRequest = null,
  }) {
    const db = getDB();
    const result = db
      .prepare(
        `
            INSERT INTO payments (order_id, gateway, amount, transaction_id, status, raw_request)
            VALUES (?, ?, ?, ?, 'pending', ?)
        `,
      )
      .run(orderId, gateway, amount, transactionId, JSON.stringify(rawRequest));
    return lastId(result);
  },

  // Tìm theo order_id
  findByOrderId(orderId) {
    const db = getDB();
    return db
      .prepare(
        "SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1",
      )
      .get(orderId);
  },

  // Tìm theo transaction_id (VNPay, MoMo reference)
  findByTransactionId(transactionId) {
    const db = getDB();
    return db
      .prepare("SELECT * FROM payments WHERE transaction_id = ?")
      .get(transactionId);
  },

  // Cập nhật kết quả thanh toán
  updateStatus(id, { status, transactionId, gatewayRef, rawResponse }) {
    const db = getDB();
    const paidAt = status === "success" ? "datetime('now')" : "NULL";
    return db
      .prepare(
        `
            UPDATE payments
            SET status = ?,
                transaction_id = COALESCE(?, transaction_id),
                gateway_ref = ?,
                raw_response = ?,
                paid_at = CASE WHEN ? = 'success' THEN datetime('now') ELSE paid_at END
            WHERE id = ?
        `,
      )
      .run(
        status,
        transactionId || null,
        gatewayRef || null,
        JSON.stringify(rawResponse),
        status,
        id,
      );
  },

  // Đánh dấu thanh toán thành công (shortcut)
  markSuccess(orderId, { transactionId, gatewayRef, rawResponse } = {}) {
    const db = getDB();
    db.prepare(
      `
            UPDATE payments 
            SET status = 'success', transaction_id = ?, gateway_ref = ?, raw_response = ?, paid_at = datetime('now')
            WHERE order_id = ?
        `,
    ).run(
      transactionId || null,
      gatewayRef || null,
      JSON.stringify(rawResponse || {}),
      orderId,
    );
    // Cập nhật trạng thái đơn hàng
    db.prepare(
      "UPDATE orders SET status = 'confirmed', updated_at = datetime('now') WHERE id = ?",
    ).run(orderId);
  },

  // Đánh dấu thanh toán thất bại
  markFailed(orderId, rawResponse = {}) {
    const db = getDB();
    db.prepare(
      `
            UPDATE payments
            SET status = 'failed', raw_response = ?
            WHERE order_id = ?
        `,
    ).run(JSON.stringify(rawResponse), orderId);
  },

  // Thống kê doanh thu theo gateway
  statsByGateway() {
    const db = getDB();
    return db
      .prepare(
        `
            SELECT gateway, 
                COUNT(*) as count,
                SUM(amount) as total,
                SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_count
            FROM payments
            GROUP BY gateway
        `,
      )
      .all();
  },
};

module.exports = Payment;
