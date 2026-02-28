// ============================================================
// VINOVA — Firebase Configuration & Analytics
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyD4gGYW9w3qblgnD9doMEwWHwh_uDSePkU",
    authDomain: "webbanruou-4291f.firebaseapp.com",
    projectId: "webbanruou-4291f",
    storageBucket: "webbanruou-4291f.firebasestorage.app",
    messagingSenderId: "465267767114",
    appId: "1:465267767114:web:4bb76680c458cbb909f3b3",
    measurementId: "G-J8P2F6SFBQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ─── Track page views ─────────────────────────────────────────
export function trackPageView(pageName) {
    logEvent(analytics, 'page_view', { page_title: pageName });
}

// ─── Track product views ──────────────────────────────────────
export function trackProductView(product) {
    logEvent(analytics, 'view_item', {
        item_id: product.id,
        item_name: product.name,
        item_category: product.type,
        value: product.price,
        currency: 'VND'
    });
}

// ─── Track add to cart ────────────────────────────────────────
export function trackAddToCart(product, quantity = 1) {
    logEvent(analytics, 'add_to_cart', {
        item_id: product.id,
        item_name: product.name,
        item_category: product.type,
        quantity: quantity,
        value: product.price * quantity,
        currency: 'VND'
    });
}

// ─── Track purchase ───────────────────────────────────────────
export function trackPurchase(orderId, total, items) {
    logEvent(analytics, 'purchase', {
        transaction_id: orderId,
        value: total,
        currency: 'VND',
        items: items
    });
}

console.log('🔥 Firebase Analytics initialized');
