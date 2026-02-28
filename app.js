/* ============================================================
   VINOVA — Main Application JavaScript
   ============================================================ */

// ─── STATE ────────────────────────────────────────────────────
const state = {
  cart: JSON.parse(localStorage.getItem('vinova_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('vinova_wishlist') || '[]'),
  currency: localStorage.getItem('vinova_currency') || 'VND',
  lang: localStorage.getItem('vinova_lang') || 'vi',
  ageVerified: localStorage.getItem('vinova_age') === 'true',
  user: JSON.parse(localStorage.getItem('vinova_user') || 'null'),
  filters: { types: [], regions: [], grapes: [], priceMin: 0, priceMax: 50000000, abvMin: 0, abvMax: 60, ratings: [] },
  page: 'home',
  checkoutStep: 1,
};

// ─── PRODUCTS DATABASE ────────────────────────────────────────
const PRODUCTS = [
  {
    id: 1, name: "Château Lafite Rothschild", vintage: 2018,
    region: "Pháp", subregion: "Bordeaux", type: "red",
    grape: "Cabernet Sauvignon", abv: 13.5, volume: "750ml",
    price: 18500000, oldPrice: 21000000,
    score: 98, rating: 4.9, reviews: 234,
    badge: "Best Seller",
    img: "images/red_wine.jpg",
    tasting: { color: "Đỏ rubis sâu", nose: "Cassis, hương gỗ sồi, hoa violets", palate: "Tannic mịn, thanh lịch, phức hợp", finish: "Dài >90 giây" },
    food: ["Bò bít tết", "Thịt cừu nướng", "Pho mát cứng"],
    tags: ["premium", "collection", "gift"],
    stock: 12,
  },
  {
    id: 2, name: "Domaine de la Romanée-Conti", vintage: 2017,
    region: "Pháp", subregion: "Burgundy", type: "red",
    grape: "Pinot Noir", abv: 13.0, volume: "750ml",
    price: 95000000, oldPrice: null,
    score: 100, rating: 5.0, reviews: 48,
    badge: "Hiếm",
    img: "images/white_wine.jpg",
    tasting: { color: "Đỏ garnet trong suốt", nose: "Cherry đỏ, hoa hồng, đất quý", palate: "Tinh tế, phức hợp phi thường", finish: ">2 phút" },
    food: ["Phô mai Comté", "Nấm truffle", "Cá hồi hun khói"],
    tags: ["luxury", "rare", "collection"],
    stock: 3,
  },
  {
    id: 3, name: "Opus One Reserve", vintage: 2019,
    region: "Mỹ", subregion: "Napa Valley", type: "red",
    grape: "Cabernet Sauvignon blend", abv: 14.5, volume: "750ml",
    price: 12800000, oldPrice: 14500000,
    score: 96, rating: 4.8, reviews: 187,
    badge: "Mới về",
    img: "images/red_wine.jpg",
    tasting: { color: "Đỏ tím đậm", nose: "Mứt mận, chocolate đen, vanilla", palate: "Dày dặn, mượt mà", finish: "Dài ấm áp" },
    food: ["Sườn bò nướng BBQ", "Xốt nấm rừng", "Phô mai cheddar"],
    tags: ["premium", "new"],
    stock: 24,
  },
  {
    id: 4, name: "Dom Pérignon Vintage", vintage: 2013,
    region: "Pháp", subregion: "Champagne", type: "sparkling",
    grape: "Chardonnay / Pinot Noir", abv: 12.5, volume: "750ml",
    price: 7200000, oldPrice: 8500000,
    score: 97, rating: 4.9, reviews: 312,
    badge: "Sale 15%",
    img: "images/white_wine.jpg",
    tasting: { color: "Vàng rơm óng ánh", nose: "Bánh mì nướng, chanh vàng, acacia", palate: "Sủi bọt mịn, tinh tế", finish: "Tươi mát dài" },
    food: ["Hải sản tươi", "Oyster", "Caviar", "Sashimi"],
    tags: ["champagne", "gift", "celebration"],
    stock: 36,
  },
  {
    id: 5, name: "Macallan 25 Year Sherry Oak", vintage: null,
    region: "Scotland", subregion: "Speyside", type: "whisky",
    grape: null, abv: 43.0, volume: "700ml",
    price: 52000000, oldPrice: null,
    score: 95, rating: 4.9, reviews: 89,
    badge: "Siêu hiếm",
    img: "images/red_wine.jpg",
    tasting: { color: "Amber vàng tươi", nose: "Sherry ngọt, vanilla, gừng", palate: "Mịn như nhung, phong phú", finish: "Rất dài ấm áp" },
    food: ["Chocolate đen", "Cigar Cuba", "Phô mai cứng"],
    tags: ["whisky", "luxury", "rare"],
    stock: 5,
  },
  {
    id: 6, name: "Sassicaia 2020", vintage: 2020,
    region: "Ý", subregion: "Bolgheri", type: "red",
    grape: "Cabernet Sauvignon", abv: 13.5, volume: "750ml",
    price: 6800000, oldPrice: 7500000,
    score: 94, rating: 4.7, reviews: 156,
    badge: null,
    img: "images/white_wine.jpg",
    tasting: { color: "Đỏ rubis đậm", nose: "Blackberry, ceder, herbs Địa Trung Hải", palate: "Đậm đà, cấu trúc tốt", finish: "Dài và nhất quán" },
    food: ["Pasta thịt bò", "Pizza thịt nguội", "Cá ngừ tươi"],
    tags: ["italian", "premium"],
    stock: 30,
  },
  {
    id: 7, name: "Cloudy Bay Sauvignon Blanc", vintage: 2022,
    region: "New Zealand", subregion: "Marlborough", type: "white",
    grape: "Sauvignon Blanc", abv: 13.0, volume: "750ml",
    price: 850000, oldPrice: 1000000,
    score: 91, rating: 4.5, reviews: 428,
    badge: "Bán chạy",
    img: "images/white_wine.jpg",
    tasting: { color: "Vàng nhạt trong suốt", nose: "Chanh dây, lý chua, cỏ mới cắt", palate: "Sắc sảo, tươi mát", finish: "Thanh và sạch" },
    food: ["Gỏi hải sản", "Sushi", "Salad rau thơm"],
    tags: ["white", "everyday"],
    stock: 120,
  },
  {
    id: 8, name: "Concha y Toro Don Melchor", vintage: 2020,
    region: "Chile", subregion: "Puente Alto", type: "red",
    grape: "Cabernet Sauvignon", abv: 14.5, volume: "750ml",
    price: 2200000, oldPrice: 2800000,
    score: 93, rating: 4.6, reviews: 203,
    badge: "Combo tiết kiệm",
    img: "images/red_wine.jpg",
    tasting: { color: "Đỏ tím thẫm", nose: "Cassis chín, café espresso, hương gỗ", palate: "Đầy đặn, cân bằng xuất sắc", finish: "Dài và tinh tế" },
    food: ["Bò wagyu", "Lamb chop", "Dark chocolate"],
    tags: ["value", "south-america"],
    stock: 58,
  },
];

// ─── CURRENCY CONFIG ──────────────────────────────────────────
const CURRENCIES = {
  VND: { symbol: '₫', rate: 1, format: v => `${(v).toLocaleString('vi-VN')}₫` },
  USD: { symbol: '$', rate: 0.000039, format: v => `$${(v * 0.000039).toFixed(2)}` },
  EUR: { symbol: '€', rate: 0.000036, format: v => `€${(v * 0.000036).toFixed(2)}` },
};

function formatPrice(vnd) {
  return CURRENCIES[state.currency].format(vnd);
}

// ─── UTILITIES ────────────────────────────────────────────────
function saveState() {
  localStorage.setItem('vinova_cart', JSON.stringify(state.cart));
  localStorage.setItem('vinova_wishlist', JSON.stringify(state.wishlist));
  localStorage.setItem('vinova_currency', state.currency);
  localStorage.setItem('vinova_lang', state.lang);
}

function showToast(msg, type = 'info', duration = 3000) {
  const icons = { success: '✓', error: '✕', info: '🍷' };
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span style="font-size:1.1rem">${icons[type]}</span><span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => { t.style.animation = 'slideInRight .3s ease reverse'; setTimeout(() => t.remove(), 300); }, duration);
}

function cartCount() { return state.cart.reduce((s, i) => s + i.qty, 0); }

function updateCartBadge() {
  document.querySelectorAll('.cart-badge').forEach(el => {
    const count = cartCount();
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

// ─── AGE GATE ─────────────────────────────────────────────────
function initAgeGate() {
  const overlay = document.getElementById('ageGate');
  if (!overlay) return;
  if (state.ageVerified) { overlay.remove(); return; }

  document.getElementById('ageYes')?.addEventListener('click', () => {
    state.ageVerified = true;
    localStorage.setItem('vinova_age', 'true');
    overlay.style.animation = 'fadeIn .3s ease reverse';
    setTimeout(() => overlay.remove(), 300);
  });
  document.getElementById('ageNo')?.addEventListener('click', () => {
    window.location.href = 'https://google.com';
  });
  document.getElementById('ageDobConfirm')?.addEventListener('click', () => {
    const d = +document.getElementById('dobDay')?.value;
    const m = +document.getElementById('dobMonth')?.value;
    const y = +document.getElementById('dobYear')?.value;
    if (!d || !m || !y) { showToast('Vui lòng nhập đầy đủ ngày sinh', 'error'); return; }
    const dob = new Date(y, m - 1, d);
    const age = (new Date() - dob) / (1000 * 60 * 60 * 24 * 365.25);
    if (age >= 18) {
      state.ageVerified = true; localStorage.setItem('vinova_age', 'true');
      overlay.style.animation = 'fadeIn .3s ease reverse';
      setTimeout(() => overlay.remove(), 300);
    } else { showToast('Bạn chưa đủ 18 tuổi để truy cập trang này', 'error'); }
  });
}

// ─── NAVIGATION ───────────────────────────────────────────────
function navigate(page, data = {}) {
  state.page = page;
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`page-${page}`);
  if (target) { target.classList.add('active'); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  document.querySelectorAll('.navbar__link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === page);
  });
  window.scrollTo(0, 0);
  if (page === 'products') renderProductListing();
  if (page === 'product-detail' && data.id) renderProductDetail(data.id);
  if (page === 'cart') renderCart();
  if (page === 'checkout') renderCheckout();
  if (page === 'account') renderAccount();
  if (page === 'admin') renderAdmin();
  if (page === 'wine-club') renderWineClub();
}

// ─── HAMBURGER ────────────────────────────────────────────────
function initNav() {
  document.querySelector('.hamburger')?.addEventListener('click', () => {
    document.querySelector('.navbar__menu')?.classList.toggle('open');
  });
  document.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', (e) => {
      const page = link.dataset.page;
      if (page) { e.preventDefault(); navigate(page); document.querySelector('.navbar__menu')?.classList.remove('open'); }
    });
  });
  window.addEventListener('scroll', () => {
    document.querySelector('.navbar')?.classList.toggle('scrolled', window.scrollY > 30);
  });
  // Currency
  document.getElementById('currencySelect')?.addEventListener('change', (e) => {
    state.currency = e.target.value; saveState(); updatePrices();
  });
}

function updatePrices() {
  document.querySelectorAll('[data-price]').forEach(el => {
    el.textContent = formatPrice(+el.dataset.price);
  });
}

// ─── PRODUCT LISTING ──────────────────────────────────────────
function renderProductListing() {
  const container = document.getElementById('productGrid');
  if (!container) return;
  let products = [...PRODUCTS];
  // Apply filters
  if (state.filters.types.length) products = products.filter(p => state.filters.types.includes(p.type));
  if (state.filters.regions.length) products = products.filter(p => state.filters.regions.includes(p.region));
  // Apply sort
  const sort = document.getElementById('sortSelect')?.value || 'popular';
  if (sort === 'price-asc') products.sort((a,b) => a.price - b.price);
  else if (sort === 'price-desc') products.sort((a,b) => b.price - a.price);
  else if (sort === 'rating') products.sort((a,b) => b.rating - a.rating);
  else if (sort === 'newest') products.sort((a,b) => (b.vintage||0) - (a.vintage||0));

  document.getElementById('listingCount').textContent = `${products.length} sản phẩm`;
  container.innerHTML = products.map(p => productCardHTML(p)).join('');
  attachProductCardEvents();
}

function productCardHTML(p) {
  const isWishlisted = state.wishlist.includes(p.id);
  return `
  <div class="product-card" data-id="${p.id}">
    <div class="product-card__img-wrap">
      <img class="product-card__img" src="${p.img}" alt="${p.name}" onerror="this.src='images/placeholder.jpg'">
      ${p.badge ? `<div class="product-card__badge"><span class="badge badge--gold">${p.badge}</span></div>` : ''}
      <button class="product-card__wishlist ${isWishlisted?'active':''}" data-wish="${p.id}" title="Thêm yêu thích">
        ${isWishlisted ? '♥' : '♡'}
      </button>
      <div class="product-card__actions">
        <button class="btn btn--primary btn--sm" style="flex:1" data-add="${p.id}">🛒 Thêm vào giỏ</button>
        <button class="btn btn--outline btn--sm" data-detail="${p.id}">Chi tiết</button>
      </div>
    </div>
    <div class="product-card__info">
      <div class="product-card__region">${p.region} ${p.subregion ? `· ${p.subregion}` : ''}</div>
      <div class="product-card__name">${p.name}</div>
      <div class="product-card__vintage">${p.vintage ? `Vintage ${p.vintage}` : ''} ${p.grape ? `· ${p.grape}` : ''} · ${p.volume}</div>
      <div class="product-card__footer">
        <div>
          <div class="product-card__price" data-price="${p.price}">${formatPrice(p.price)}</div>
          ${p.oldPrice ? `<div class="product-card__price-old" data-price="${p.oldPrice}">${formatPrice(p.oldPrice)}</div>` : ''}
        </div>
        <div class="product-card__rating">★ ${p.rating} <span style="color:var(--c-muted)">(${p.reviews})</span></div>
      </div>
    </div>
  </div>`;
}

function attachProductCardEvents() {
  document.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); addToCart(+btn.dataset.add); });
  });
  document.querySelectorAll('[data-detail]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); navigate('product-detail', { id: +btn.dataset.detail }); });
  });
  document.querySelectorAll('[data-wish]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = +btn.dataset.wish;
      if (state.wishlist.includes(id)) {
        state.wishlist.splice(state.wishlist.indexOf(id), 1);
        btn.classList.remove('active'); btn.textContent = '♡';
        showToast('Đã xóa khỏi danh sách yêu thích', 'info');
      } else {
        state.wishlist.push(id);
        btn.classList.add('active'); btn.textContent = '♥';
        showToast('Đã thêm vào danh sách yêu thích 💛', 'success');
      }
      saveState();
    });
  });
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('button')) navigate('product-detail', { id: +card.dataset.id });
    });
  });
}

// ─── PRODUCT DETAIL ───────────────────────────────────────────
function renderProductDetail(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const container = document.getElementById('productDetailContent');
  if (!container) return;

  const stars = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(p.rating));

  container.innerHTML = `
  <div class="product-detail animate-up">
    <!-- Gallery -->
    <div class="product-gallery">
      <div class="gallery-main">
        <img src="${p.img}" alt="${p.name}" id="galleryMain" onerror="this.src='images/placeholder.jpg'">
      </div>
      <div class="gallery-thumbs">
        ${[p.img, p.img, p.img].map((img, i) => `
          <div class="gallery-thumb ${i===0?'active':''}" onclick="switchThumb(this,'${img}')">
            <img src="${img}" alt="" onerror="this.src='images/placeholder.jpg'">
          </div>`).join('')}
      </div>
    </div>
    <!-- Info -->
    <div class="product-info">
      <div class="product-info__breadcrumb">
        <span style="cursor:pointer;color:var(--c-gold)" onclick="navigate('home')">Trang chủ</span>
        <span>›</span>
        <span style="cursor:pointer;color:var(--c-gold)" onclick="navigate('products')">Sản phẩm</span>
        <span>›</span>
        <span>${p.name}</span>
      </div>
      <div class="product-info__brand">${p.region} · ${p.subregion || ''}</div>
      <h1 class="product-info__title">${p.name}</h1>
      <div class="product-info__rating">
        <div class="stars">${stars}</div>
        <span class="review-count">${p.reviews} đánh giá</span>
        ${p.score ? `<div class="score-badge">${p.score}</div>` : ''}
        <span class="badge badge--red">RP Score</span>
      </div>
      <div class="product-info__meta">
        ${p.vintage ? `<div class="meta-item"><div class="meta-item__label">Vintage</div><div class="meta-item__value">${p.vintage}</div></div>` : ''}
        <div class="meta-item"><div class="meta-item__label">Nồng độ</div><div class="meta-item__value">${p.abv}%</div></div>
        <div class="meta-item"><div class="meta-item__label">Dung tích</div><div class="meta-item__value">${p.volume}</div></div>
        ${p.grape ? `<div class="meta-item"><div class="meta-item__label">Giống nho</div><div class="meta-item__value" style="font-size:.8rem">${p.grape}</div></div>` : ''}
        <div class="meta-item"><div class="meta-item__label">Tồn kho</div><div class="meta-item__value" style="color:${p.stock<10?'#e88a8a':'var(--c-success)'}">${p.stock < 10 ? `⚠ ${p.stock} chai` : `✓ Còn hàng`}</div></div>
      </div>
      <div class="product-info__price">
        <span class="price-main" data-price="${p.price}">${formatPrice(p.price)}</span>
        ${p.oldPrice ? `<span class="price-old" data-price="${p.oldPrice}">${formatPrice(p.oldPrice)}</span>` : ''}
        ${p.oldPrice ? `<span class="badge badge--red">-${Math.round((1-p.price/p.oldPrice)*100)}%</span>` : ''}
      </div>
      <div class="variant-selector">
        <div class="variant-selector__label">Dung tích</div>
        <div class="variant-options">
          <button class="variant-btn active">750ml</button>
          <button class="variant-btn">1.5L Magnum</button>
          <button class="variant-btn">Thùng 6 chai</button>
        </div>
      </div>
      <div class="qty-selector">
        <button class="qty-btn" id="qtyMinus">−</button>
        <span class="qty-value" id="qtyVal">1</span>
        <button class="qty-btn" id="qtyPlus">+</button>
        <span style="font-size:.82rem;color:var(--c-muted);margin-left:.5rem">Tối đa ${p.stock} chai</span>
      </div>
      <div style="display:flex;gap:.75rem;margin-bottom:1.5rem;flex-wrap:wrap">
        <button class="btn btn--primary btn--lg" style="flex:1;min-width:180px" onclick="addToCart(${p.id},+document.getElementById('qtyVal').textContent)">🛒 Thêm vào giỏ hàng</button>
        <button class="btn btn--outline" onclick="toggleWishlist(${p.id},this)">
          ${state.wishlist.includes(p.id) ? '♥ Đã yêu thích' : '♡ Yêu thích'}
        </button>
      </div>
      <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:2rem">
        <span class="badge badge--muted">🔒 Thanh toán an toàn</span>
        <span class="badge badge--muted">🚚 Giao hàng toàn quốc</span>
        <span class="badge badge--muted">🌡 Bảo quản nhiệt độ</span>
        <span class="badge badge--muted">✍ Yêu cầu CMND khi nhận</span>
      </div>
      <!-- Tabs -->
      <div class="tab-nav">
        <button class="tab-btn active" data-tab="tasting">Hương vị</button>
        <button class="tab-btn" data-tab="pairing">Món ăn kèm</button>
        <button class="tab-btn" data-tab="delivery">Vận chuyển</button>
        <button class="tab-btn" data-tab="reviews">Đánh giá</button>
      </div>
      <div class="tab-content active" id="tab-tasting">
        <div class="tasting-notes">
          <div class="tasting-note"><div class="tasting-note__icon">👁</div><div class="tasting-note__label">Màu sắc</div><div class="tasting-note__value">${p.tasting.color}</div></div>
          <div class="tasting-note"><div class="tasting-note__icon">👃</div><div class="tasting-note__label">Mùi hương</div><div class="tasting-note__value">${p.tasting.nose}</div></div>
          <div class="tasting-note"><div class="tasting-note__icon">👅</div><div class="tasting-note__label">Vị</div><div class="tasting-note__value">${p.tasting.palate}</div></div>
        </div>
        <div style="margin-top:1rem;padding:1rem;background:var(--c-surface2);border-radius:var(--radius-sm)">
          <div style="font-size:.8rem;color:var(--c-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.4rem">Aftertaste</div>
          <div style="font-size:.92rem">${p.tasting.finish}</div>
        </div>
      </div>
      <div class="tab-content" id="tab-pairing">
        <div style="display:flex;flex-wrap:wrap;gap:.5rem">
          ${p.food.map(f => `<span class="badge badge--gold" style="font-size:.85rem;padding:.4rem .9rem">🍽 ${f}</span>`).join('')}
        </div>
      </div>
      <div class="tab-content" id="tab-delivery">
        <div style="display:flex;flex-direction:column;gap:.75rem;font-size:.9rem">
          <div>🚚 <strong>Giao hàng nhanh:</strong> 2-4 giờ (Nội thành HCM/HN) — Phí ${formatPrice(50000)}</div>
          <div>📦 <strong>Giao hàng tiêu chuẩn:</strong> 1-3 ngày (Toàn quốc) — Phí ${formatPrice(30000)}</div>
          <div>🌡 <strong>Bảo quản nhiệt độ:</strong> Xe lạnh chuyên dụng 10-15°C</div>
          <div>✍ <strong>Xác minh danh tính:</strong> Người nhận phải xuất trình CMND/CCCD (18+)</div>
          <div>🚫 <strong>Không giao đến:</strong> Các khu vực cấm bán rượu theo quy định địa phương</div>
        </div>
      </div>
      <div class="tab-content" id="tab-reviews">
        ${generateReviewsHTML(p)}
      </div>
    </div>
  </div>`;

  // Qty controls
  let qty = 1;
  document.getElementById('qtyMinus')?.addEventListener('click', () => { if (qty > 1) { qty--; document.getElementById('qtyVal').textContent = qty; } });
  document.getElementById('qtyPlus')?.addEventListener('click', () => { if (qty < p.stock) { qty++; document.getElementById('qtyVal').textContent = qty; } });

  // Tabs
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`)?.classList.add('active');
    });
  });
  // Variant buttons
  container.querySelectorAll('.variant-btn').forEach(btn => {
    btn.addEventListener('click', () => { container.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); });
  });
}

window.switchThumb = (el, src) => {
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const main = document.getElementById('galleryMain');
  if (main) main.src = src;
};
window.toggleWishlist = (id, btn) => {
  if (state.wishlist.includes(id)) {
    state.wishlist.splice(state.wishlist.indexOf(id), 1);
    btn.textContent = '♡ Yêu thích'; showToast('Đã xóa khỏi yêu thích', 'info');
  } else {
    state.wishlist.push(id); btn.textContent = '♥ Đã yêu thích'; showToast('Đã thêm vào yêu thích 💛', 'success');
  }
  saveState();
};

function generateReviewsHTML(p) {
  const reviews = [
    { name: 'Nguyễn Văn A', rating: 5, comment: 'Rượu tuyệt vời, hương vị phức hợp và dư vị rất dài. Sẽ mua lại!', date: '15/01/2025' },
    { name: 'Trần Thị B', rating: 5, comment: 'Đóng gói cẩn thận, giao hàng đúng nhiệt độ. Món quà hoàn hảo cho sếp!', date: '12/01/2025' },
    { name: 'Lê Minh C', rating: 4, comment: 'Chất lượng xứng đáng với giá tiền. Khá cao cấp.', date: '08/01/2025' },
  ];
  return `<div style="display:flex;flex-direction:column;gap:1.25rem">
    ${reviews.map(r => `<div style="padding:1rem;background:var(--c-surface2);border-radius:var(--radius-sm)">
      <div style="display:flex;justify-content:space-between;margin-bottom:.4rem">
        <strong>${r.name}</strong><span style="color:var(--c-muted);font-size:.8rem">${r.date}</span>
      </div>
      <div style="color:var(--c-gold);margin-bottom:.4rem">${'★'.repeat(r.rating)}</div>
      <div style="font-size:.9rem;color:var(--c-muted)">${r.comment}</div>
    </div>`).join('')}
  </div>`;
}

// ─── CART ─────────────────────────────────────────────────────
function addToCart(id, qty = 1) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const existing = state.cart.find(i => i.id === id);
  if (existing) existing.qty = Math.min(existing.qty + qty, p.stock);
  else state.cart.push({ id, qty, name: p.name, price: p.price, img: p.img, volume: p.volume });
  saveState(); updateCartBadge();
  showToast(`Đã thêm ${p.name} vào giỏ hàng`, 'success');
  if (state.page === 'cart') renderCart();
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const emptyMsg = document.getElementById('cartEmpty');
  if (!container) return;
  if (state.cart.length === 0) {
    container.innerHTML = '';
    if (emptyMsg) emptyMsg.style.display = 'block';
    updateOrderSummary();
    return;
  }
  if (emptyMsg) emptyMsg.style.display = 'none';
  container.innerHTML = state.cart.map(item => {
    const p = PRODUCTS.find(x => x.id === item.id);
    return `<div class="cart-item" data-cart-id="${item.id}">
      <img class="cart-item__img" src="${item.img}" alt="${item.name}" onerror="this.src='images/placeholder.jpg'">
      <div class="cart-item__info">
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__meta">${item.volume} · ${p?.region || ''}</div>
        <div class="cart-item__actions">
          <button class="qty-btn" onclick="changeCartQty(${item.id},-1)">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" onclick="changeCartQty(${item.id},1)">+</button>
          <button class="btn btn--sm" style="color:var(--c-error);background:rgba(192,57,43,.1);border:1px solid rgba(192,57,43,.2)" onclick="removeFromCart(${item.id})">✕ Xóa</button>
        </div>
      </div>
      <div class="cart-item__price">${formatPrice(item.price * item.qty)}</div>
    </div>`;
  }).join('');
  updateOrderSummary();
}

window.changeCartQty = (id, delta) => {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveState(); renderCart();
};
window.removeFromCart = (id) => {
  state.cart = state.cart.filter(i => i.id !== id);
  saveState(); updateCartBadge(); renderCart();
  showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
};

function cartTotal() { return state.cart.reduce((s, i) => s + i.price * i.qty, 0); }

function updateOrderSummary() {
  const subtotal = cartTotal();
  const shipping = subtotal > 5000000 ? 0 : 50000;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + shipping + tax;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('summarySubtotal', formatPrice(subtotal));
  set('summaryShipping', shipping === 0 ? 'Miễn phí' : formatPrice(shipping));
  set('summaryTax', formatPrice(tax));
  set('summaryTotal', formatPrice(total));
}

// ─── CHECKOUT ─────────────────────────────────────────────────
function renderCheckout() {
  updateOrderSummary();
  goToCheckoutStep(1);
}

function goToCheckoutStep(step) {
  state.checkoutStep = step;
  document.querySelectorAll('.checkout-step').forEach((s, i) => {
    s.classList.remove('active', 'done');
    if (i + 1 < step) s.classList.add('done');
    else if (i + 1 === step) s.classList.add('active');
  });
  document.querySelectorAll('.checkout-panel').forEach((p, i) => {
    p.classList.toggle('active', i + 1 === step);
  });
}

window.nextCheckoutStep = () => {
  if (state.checkoutStep < 4) goToCheckoutStep(state.checkoutStep + 1);
  if (state.checkoutStep === 4) { completeOrder(); }
};
window.prevCheckoutStep = () => { if (state.checkoutStep > 1) goToCheckoutStep(state.checkoutStep - 1); };
function completeOrder() {
  state.cart = []; saveState(); updateCartBadge();
  goToCheckoutStep(4);
  showToast('🎉 Đơn hàng đã được đặt thành công!', 'success', 5000);
}

// ─── ACCOUNT ──────────────────────────────────────────────────
function renderAccount() { /* renders static demo content */ }

// ─── ADMIN ────────────────────────────────────────────────────
function renderAdmin() {
  document.querySelectorAll('.admin-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const section = item.dataset.section;
      document.querySelectorAll('.admin-section').forEach(s => s.classList.toggle('hidden', s.id !== `admin-${section}`));
    });
  });
  renderCharts();
}

function renderCharts() {
  const months = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
  const revenue = [120,145,208,189,260,310,285,340,295,380,420,510];
  const maxVal = Math.max(...revenue);
  const chart = document.getElementById('revenueChart');
  if (!chart) return;
  chart.innerHTML = `<div class="chart-bar-wrap">${months.map((m,i) => `
    <div class="chart-bar-col">
      <div class="chart-bar" style="height:${(revenue[i]/maxVal)*180}px;background:linear-gradient(to top,var(--c-red-wine),var(--c-gold))" title="${revenue[i]}M"></div>
      <div class="chart-label">${m}</div>
    </div>`).join('')}</div>`;
}

// ─── WINE CLUB ────────────────────────────────────────────────
function renderWineClub() { /* static content */ }

// ─── FILTER EVENTS ────────────────────────────────────────────
function initFilters() {
  document.querySelectorAll('.filter-option input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', () => {
      const cat = cb.dataset.filter, val = cb.value;
      if (!state.filters[cat]) state.filters[cat] = [];
      if (cb.checked) { if (!state.filters[cat].includes(val)) state.filters[cat].push(val); }
      else { state.filters[cat] = state.filters[cat].filter(v => v !== val); }
      if (state.page === 'products') renderProductListing();
    });
  });
  document.getElementById('sortSelect')?.addEventListener('change', () => {
    if (state.page === 'products') renderProductListing();
  });
  document.getElementById('filterMobileBtn')?.addEventListener('click', () => {
    document.querySelector('.filter-sidebar')?.classList.toggle('open');
  });
}

// ─── SEARCH ───────────────────────────────────────────────────
function initSearch() {
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  if (!input || !results) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    if (!q) { results.classList.add('hidden'); return; }
    const matched = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.region.toLowerCase().includes(q) ||
      (p.grape || '').toLowerCase().includes(q)
    ).slice(0, 5);
    if (!matched.length) { results.innerHTML = `<div style="padding:1rem;color:var(--c-muted);font-size:.88rem">Không tìm thấy kết quả</div>`; }
    else results.innerHTML = matched.map(p => `
      <div class="search-result-item" style="display:flex;align-items:center;gap:.75rem;padding:.75rem 1rem;cursor:pointer;transition:background .2s;border-bottom:1px solid var(--c-border)" onmouseover="this.style.background='var(--c-surface2)'" onmouseout="this.style.background=''" onclick="navigate('product-detail',{id:${p.id}});results.classList.add('hidden');input.value=''">
        <img src="${p.img}" style="width:36px;height:48px;object-fit:cover;border-radius:4px" onerror="this.src='images/placeholder.jpg'">
        <div><div style="font-size:.88rem;font-weight:500">${p.name}</div><div style="font-size:.75rem;color:var(--c-muted)">${p.region} · ${formatPrice(p.price)}</div></div>
      </div>`).join('');
    results.classList.remove('hidden');
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.search-wrap')) results.classList.add('hidden'); });
}

// ─── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initAgeGate();
  initNav();
  initFilters();
  initSearch();
  updateCartBadge();
  // Render featured products on homepage
  const featuredContainer = document.getElementById('featuredProducts');
  if (featuredContainer) {
    featuredContainer.innerHTML = PRODUCTS.slice(0, 4).map(p => productCardHTML(p)).join('');
    attachProductCardEvents();
  }
  // Navigate to hash page
  const hash = window.location.hash.replace('#', '') || 'home';
  navigate(['home','products','cart','checkout','account','wine-club','admin','product-detail'].includes(hash) ? hash : 'home');
  console.log('%cVINOVA Premium Wine & Spirits', 'color:#c9a84c;font-size:1.2rem;font-weight:bold');
});
