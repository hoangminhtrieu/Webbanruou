// ============================================================
// VINOVA — Frontend API Client
// Connects the frontend to the Node.js backend
// ============================================================

const API_BASE = 'http://localhost:3001/api';

// ─── Core fetch wrapper ───────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('vinova_token');
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
        const data = await res.json();
        if (!res.ok) {
            if (res.status === 401 && data.code === 'TOKEN_EXPIRED') {
                localStorage.removeItem('vinova_token');
                localStorage.removeItem('vinova_user');
                window.dispatchEvent(new CustomEvent('auth:logout'));
            }
            throw new Error(data.error || data.errors?.[0]?.msg || 'Lỗi không xác định');
        }
        return data;
    } catch (err) {
        if (err instanceof TypeError) throw new Error('Không thể kết nối tới server. Vui lòng chạy: npm run dev trong thư mục server/');
        throw err;
    }
}

const API = {
    // ─── AUTH ───────────────────────────────────────
    auth: {
        register: (data) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
        login: (data) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
        me: () => apiFetch('/auth/me'),
        changePassword: (data) => apiFetch('/auth/password', { method: 'PUT', body: JSON.stringify(data) }),
    },

    // ─── PRODUCTS ───────────────────────────────────
    products: {
        list: (params = {}) => apiFetch('/products?' + new URLSearchParams(params)),
        get: (id) => apiFetch(`/products/${id}`),
        search: (q) => apiFetch(`/products/search?q=${encodeURIComponent(q)}`),
        create: (data) => apiFetch('/products', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id) => apiFetch(`/products/${id}`, { method: 'DELETE' }),
    },

    // ─── CART ───────────────────────────────────────
    cart: {
        get: () => apiFetch('/cart'),
        add: (product_id, qty = 1) => apiFetch('/cart', { method: 'POST', body: JSON.stringify({ product_id, qty }) }),
        update: (product_id, qty) => apiFetch(`/cart/${product_id}`, { method: 'PUT', body: JSON.stringify({ qty }) }),
        remove: (product_id) => apiFetch(`/cart/${product_id}`, { method: 'DELETE' }),
        clear: () => apiFetch('/cart', { method: 'DELETE' }),
    },

    // ─── ORDERS ─────────────────────────────────────
    orders: {
        create: (data) => apiFetch('/orders', { method: 'POST', body: JSON.stringify(data) }),
        list: () => apiFetch('/orders'),
        get: (id) => apiFetch(`/orders/${id}`),
        updateStatus: (id, status) => apiFetch(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
        adminAll: (params = {}) => apiFetch('/orders/admin/all?' + new URLSearchParams(params)),
    },

    // ─── PAYMENTS ───────────────────────────────────
    payments: {
        vnpay: (order_id) => apiFetch('/payments/vnpay/create', { method: 'POST', body: JSON.stringify({ order_id }) }),
        momo: (order_id) => apiFetch('/payments/momo/create', { method: 'POST', body: JSON.stringify({ order_id }) }),
        stripe: (order_id) => apiFetch('/payments/stripe/create-intent', { method: 'POST', body: JSON.stringify({ order_id }) }),
        status: (order_id) => apiFetch(`/payments/status/${order_id}`),
    },

    // ─── USERS ──────────────────────────────────────
    users: {
        profile: () => apiFetch('/users/profile'),
        updateProfile: (data) => apiFetch('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
        wishlist: () => apiFetch('/users/wishlist'),
        addWishlist: (product_id) => apiFetch('/users/wishlist', { method: 'POST', body: JSON.stringify({ product_id }) }),
        removeWishlist: (id) => apiFetch(`/users/wishlist/${id}`, { method: 'DELETE' }),
        addReview: (data) => apiFetch('/users/reviews', { method: 'POST', body: JSON.stringify(data) }),
    },

    // ─── ADMIN ──────────────────────────────────────
    admin: {
        dashboard: () => apiFetch('/admin/dashboard'),
        users: (params = {}) => apiFetch('/admin/users?' + new URLSearchParams(params)),
        updateUser: (id, data) => apiFetch(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        inventory: () => apiFetch('/admin/inventory'),
    },
};

// ─── Auth helpers ─────────────────────────────────────────────
function saveAuth(token, user) {
    localStorage.setItem('vinova_token', token);
    localStorage.setItem('vinova_user', JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('auth:login', { detail: user }));
}

function clearAuth() {
    localStorage.removeItem('vinova_token');
    localStorage.removeItem('vinova_user');
}

function getAuthUser() {
    try { return JSON.parse(localStorage.getItem('vinova_user')); } catch { return null; }
}

function isLoggedIn() { return !!localStorage.getItem('vinova_token'); }

// ─── Integrate with existing app.js ──────────────────────────
// Override doLogin to use real API
window.doLogin = async function () {
    const emailEl = document.querySelector('#loginForm input[type=email]');
    const passwordEl = document.querySelector('#loginForm input[type=password]');
    if (!emailEl || !passwordEl) return;
    try {
        const data = await API.auth.login({ email: emailEl.value, password: passwordEl.value });
        saveAuth(data.token, data.user);
        window.closeLoginModal();
        window.showToast(`Chào mừng ${data.user.full_name}! 🍷`, 'success');
        updateNavForAuth(data.user);
    } catch (err) {
        window.showToast(err.message, 'error');
    }
};

window.doRegister = async function () {
    const form = document.getElementById('registerForm');
    const emailEl = form?.querySelector('input[type=email]');
    const passwordEl = form?.querySelector('input[type=password]');
    const nameInputs = form?.querySelectorAll('input:not([type])');
    const full_name = `${nameInputs?.[0]?.value || ''} ${nameInputs?.[1]?.value || ''}`.trim();
    const phoneEl = form?.querySelector('input[type=tel]');
    const addressEl = document.getElementById('registerUsername');
    try {
        const data = await API.auth.register({ email: emailEl?.value, password: passwordEl?.value, full_name, phone: phoneEl?.value, username: addressEl?.value });
        saveAuth(data.token, data.user);
        window.closeLoginModal();
        window.showToast('Tạo tài khoản thành công! Chào mừng 🎉', 'success');
        updateNavForAuth(data.user);
    } catch (err) {
        window.showToast(err.message, 'error');
    }
};


// Load products from API instead of static data
async function loadProductsFromAPI(filters = {}) {
    try {
        const data = await API.products.list(filters);
        return data.products.map(p => ({
            ...p,
            oldPrice: p.old_price,
            reviews: p.reviews_count,
        }));
    } catch {
        // Fallback to static PRODUCTS array if server not available
        return typeof PRODUCTS !== 'undefined' ? PRODUCTS : [];
    }
}

// Checkout with real API + VNPay redirect
window.checkoutWithVNPay = async function (orderData) {
    try {
        window.showToast('Đang tạo đơn hàng...', 'info');
        const orderRes = await API.orders.create(orderData);
        const payRes = await API.payments.vnpay(orderRes.order_id);
        window.showToast('Đang chuyển đến trang thanh toán VNPay...', 'info');
        window.location.href = payRes.payment_url;
    } catch (err) {
        window.showToast(err.message, 'error');
    }
};

window.checkoutWithMoMo = async function (orderData) {
    try {
        window.showToast('Đang tạo đơn hàng...', 'info');
        const orderRes = await API.orders.create(orderData);
        const payRes = await API.payments.momo(orderRes.order_id);
        if (payRes.payment_url) window.location.href = payRes.payment_url;
    } catch (err) {
        window.showToast(err.message, 'error');
    }
};

function updateNavForAuth(user) {
    const loginBtn = document.querySelector('.navbar__actions .btn--outline');
    if (loginBtn && user) {
        // Hiện họ tên đầy đủ, tối đa 20 ký tự để vừa navbar
        const name = user.full_name || '';
        loginBtn.textContent = name.length > 20 ? name.substring(0, 18) + '…' : name;
        loginBtn.onclick = () => window.navigate && window.navigate('account');
        loginBtn.style.maxWidth = '160px';
        loginBtn.style.overflow = 'hidden';
        loginBtn.style.textOverflow = 'ellipsis';
    }
}


// Listen for payment result postMessage
window.addEventListener('message', (e) => {
    if (e.data?.type === 'PAYMENT_RESULT') {
        if (e.data.success) {
            window.showToast?.('🎉 Thanh toán thành công! Đơn hàng #' + e.data.orderId + ' đã được xác nhận.', 'success', 6000);
            window.navigate?.('account');
        } else {
            window.showToast?.('❌ Thanh toán thất bại. Vui lòng thử lại.', 'error');
        }
    }
});

// Auto-restore auth state on load
(function initAuth() {
    const user = getAuthUser();
    if (user) {
        document.addEventListener('DOMContentLoaded', () => updateNavForAuth(user));
    }
})();

// Expose API globally for console debugging
window.VINOVA_API = API;
console.log('%c💡 VINOVA API available at window.VINOVA_API', 'color:#c9a84c');
