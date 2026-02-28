// ============================================================
// Payment Gateway Configuration
// ============================================================

module.exports = {
    // ─── VNPay Sandbox ──────────────────────────────────────────
    // Đăng ký tại: https://sandbox.vnpayment.vn/devreg/
    vnpay: {
        tmnCode: process.env.VNPAY_TMN_CODE || 'DEMOV210',
        hashSecret: process.env.VNPAY_HASH_SECRET || 'RAOEXHYVSDDIIENYWSLDIIZTANXUXZFJ',
        url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
        returnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3001/api/payments/vnpay/return',
        ipnUrl: process.env.VNPAY_IPN_URL || 'http://localhost:3001/api/payments/vnpay/ipn',
        version: '2.1.0',
        locale: 'vn',
        currCode: 'VND',
        orderType: 'other',
    },

    // ─── MoMo Sandbox ────────────────────────────────────────────
    // Đăng ký tại: https://developers.momo.vn/
    momo: {
        partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMOBKUN20180529',
        accessKey: process.env.MOMO_ACCESS_KEY || 'klm05TvNBzhg7h7j',
        secretKey: process.env.MOMO_SECRET_KEY || 'at67qH6mk8w5Y1nAyMoTkAVbmczrq1vU',
        apiUrl: 'https://test-payment.momo.vn/v2/gateway/api/create',
        returnUrl: process.env.MOMO_RETURN_URL || 'http://localhost:3001/api/payments/momo/callback',
        notifyUrl: process.env.MOMO_NOTIFY_URL || 'http://localhost:3001/api/payments/momo/ipn',
        requestType: 'captureWallet',
    },

    // ─── Stripe Test ─────────────────────────────────────────────
    // Đăng ký tại: https://dashboard.stripe.com
    // Test card: 4242 4242 4242 4242 | 12/34 | 123
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_STRIPE_SECRET_KEY',
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_STRIPE_PK',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_YOUR_WEBHOOK_SECRET',
        currency: 'vnd',
    },

    // ─── JWT ─────────────────────────────────────────────────────
    jwt: {
        secret: process.env.JWT_SECRET || 'vinova-super-secret-key-2025-change-in-production',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'vinova-refresh-secret-2025',
        expiresIn: '7d',
        refreshExpiresIn: '30d',
    },
};
