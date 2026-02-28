// ============================================================
// VINOVA — Firebase Configuration, Analytics & Firestore
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD4gGYW9w3qblgnD9doMEwWHwh_uDSePkU",
    authDomain: "webbanruou-4291f.firebaseapp.com",
    projectId: "webbanruou-4291f",
    storageBucket: "webbanruou-4291f.firebasestorage.app",
    messagingSenderId: "465267767114",
    appId: "1:465267767114:web:4bb76680c458cbb909f3b3",
    measurementId: "G-J8P2F6SFBQ"
};

// ─── Initialize Firebase ──────────────────────────────────────
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// ================================================================
// ANALYTICS — Theo dõi hành vi người dùng
// ================================================================

/** Theo dõi chuyển trang */
window.trackPageView = function (pageName) {
    logEvent(analytics, 'page_view', { page_title: pageName });
    console.log(`[Analytics] Page view: ${pageName}`);
};

/** Theo dõi xem sản phẩm */
window.trackProductView = function (product) {
    logEvent(analytics, 'view_item', {
        item_id: String(product.id),
        item_name: product.name,
        item_category: product.type,
        value: product.price,
        currency: 'VND'
    });
    console.log(`[Analytics] Product view: ${product.name}`);
};

/** Theo dõi thêm vào giỏ */
window.trackAddToCart = function (product, quantity = 1) {
    logEvent(analytics, 'add_to_cart', {
        item_id: String(product.id),
        item_name: product.name,
        item_category: product.type,
        quantity: quantity,
        value: product.price * quantity,
        currency: 'VND'
    });
    console.log(`[Analytics] Add to cart: ${product.name} x${quantity}`);
};

/** Theo dõi bắt đầu thanh toán */
window.trackBeginCheckout = function (total, items) {
    logEvent(analytics, 'begin_checkout', {
        value: total,
        currency: 'VND',
        items: items
    });
    console.log(`[Analytics] Begin checkout: ${total}₫`);
};

/** Theo dõi đặt hàng thành công */
window.trackPurchase = function (orderId, total, items) {
    logEvent(analytics, 'purchase', {
        transaction_id: orderId,
        value: total,
        currency: 'VND',
        items: items
    });
    console.log(`[Analytics] Purchase: ${orderId} - ${total}₫`);
};

// ================================================================
// FIRESTORE — Lưu dữ liệu đơn hàng vào database
// ================================================================

/** Lưu đơn hàng vào Firestore */
window.saveOrderToFirestore = async function (orderData) {
    try {
        const docRef = await addDoc(collection(db, 'orders'), {
            ...orderData,
            createdAt: serverTimestamp(),
            status: 'pending'
        });
        console.log(`[Firestore] Đơn hàng đã lưu: ${docRef.id}`);
        return docRef.id;
    } catch (error) {
        console.error('[Firestore] Lỗi lưu đơn hàng:', error);
    }
};

/** Lưu lượt xem sản phẩm vào Firestore */
window.saveProductViewToFirestore = async function (product) {
    try {
        await addDoc(collection(db, 'product_views'), {
            productId: product.id,
            productName: product.name,
            productType: product.type,
            price: product.price,
            viewedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('[Firestore] Lỗi lưu lượt xem:', error);
    }
};

console.log('🔥 Firebase Analytics + Firestore đã khởi tạo!');
