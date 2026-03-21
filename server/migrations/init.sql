-- ============================================================
-- VINOVA Database Schema — SQLite
-- ============================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT    NOT NULL UNIQUE,
  password    TEXT    NOT NULL,
  full_name   TEXT    NOT NULL,
  phone       TEXT,
  role        TEXT    NOT NULL DEFAULT 'customer',  -- customer | admin
  tier        TEXT    NOT NULL DEFAULT 'silver',    -- silver | gold | platinum
  points      INTEGER NOT NULL DEFAULT 0,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL UNIQUE,
  region        TEXT    NOT NULL,
  subregion     TEXT,
  type          TEXT    NOT NULL,  -- red|white|sparkling|whisky|rose
  grape         TEXT,
  abv           REAL,
  volume        TEXT    NOT NULL DEFAULT '750ml',
  price         INTEGER NOT NULL,
  old_price     INTEGER,
  stock         INTEGER NOT NULL DEFAULT 0,
  score         INTEGER,
  rating        REAL    NOT NULL DEFAULT 0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  vintage       INTEGER,
  badge         TEXT,
  img           TEXT,
  description   TEXT,
  tasting_notes TEXT,  -- JSON string
  food_pairing  TEXT,  -- JSON string
  tags          TEXT,  -- JSON string
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER REFERENCES users(id),
  guest_email     TEXT,
  status          TEXT    NOT NULL DEFAULT 'pending',
  -- pending | confirmed | shipping | completed | cancelled | refunded
  total           INTEGER NOT NULL DEFAULT 0,
  shipping_fee    INTEGER NOT NULL DEFAULT 50000,
  tax             INTEGER NOT NULL DEFAULT 0,
  gift_wrap       INTEGER NOT NULL DEFAULT 0,
  points_earned   INTEGER NOT NULL DEFAULT 0, -- Points awarded for this order
  gift_message    TEXT,
  adult_signature INTEGER NOT NULL DEFAULT 1,
  payment_method  TEXT,  -- vnpay|momo|stripe|cod
  shipping_method TEXT    DEFAULT 'standard',
  address         TEXT,  -- JSON: {name, phone, street, district, city}
  note            TEXT,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id          INTEGER NOT NULL REFERENCES orders(id),
  product_id        INTEGER NOT NULL REFERENCES products(id),
  product_name      TEXT    NOT NULL,
  product_img       TEXT,
  qty               INTEGER NOT NULL DEFAULT 1,
  price_at_purchase INTEGER NOT NULL,
  volume            TEXT
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id        INTEGER NOT NULL REFERENCES orders(id),
  gateway         TEXT    NOT NULL,  -- vnpay|momo|stripe|cod
  transaction_id  TEXT,
  gateway_ref     TEXT,
  amount          INTEGER NOT NULL,
  status          TEXT    NOT NULL DEFAULT 'pending',
  -- pending|success|failed|refunded
  raw_request     TEXT,  -- JSON
  raw_response    TEXT,  -- JSON
  paid_at         TEXT,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Cart Items (server-side cart, synced with frontend)
CREATE TABLE IF NOT EXISTS cart_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  product_id  INTEGER NOT NULL REFERENCES products(id),
  qty         INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, product_id)
);

-- Wishlists
CREATE TABLE IF NOT EXISTS wishlists (
  user_id     INTEGER NOT NULL REFERENCES users(id),
  product_id  INTEGER NOT NULL REFERENCES products(id),
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, product_id)
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id  INTEGER NOT NULL REFERENCES products(id),
  user_id     INTEGER NOT NULL REFERENCES users(id),
  rating      INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(product_id, user_id)
);

-- Wine Club Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  plan        TEXT    NOT NULL,  -- silver|gold|platinum
  status      TEXT    NOT NULL DEFAULT 'active',
  price       INTEGER NOT NULL,
  next_billing TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_type   ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_region ON products(region);
CREATE INDEX IF NOT EXISTS idx_orders_user     ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status   ON orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_order  ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_user       ON cart_items(user_id);
