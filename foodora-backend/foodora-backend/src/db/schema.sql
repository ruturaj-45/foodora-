-- ============================================================
-- FOODORA DATABASE SCHEMA
-- Run this file first to create all tables
-- ============================================================

CREATE DATABASE IF NOT EXISTS foodora CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE foodora;

-- ─── USERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          VARCHAR(36)  NOT NULL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  phone       VARCHAR(20)  NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('customer','restaurant','admin') NOT NULL DEFAULT 'customer',
  avatar      TEXT,
  status      ENUM('active','inactive','banned') NOT NULL DEFAULT 'active',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── ADDRESSES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id          VARCHAR(36)  NOT NULL PRIMARY KEY,
  user_id     VARCHAR(36)  NOT NULL,
  label       ENUM('Home','Work','Other') NOT NULL DEFAULT 'Home',
  line1       VARCHAR(200) NOT NULL,
  line2       VARCHAR(200),
  city        VARCHAR(100) NOT NULL,
  state       VARCHAR(100) NOT NULL,
  pincode     VARCHAR(10)  NOT NULL,
  is_default  TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── RESTAURANTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS restaurants (
  id            VARCHAR(36)   NOT NULL PRIMARY KEY,
  owner_id      VARCHAR(36)   NOT NULL,
  name          VARCHAR(150)  NOT NULL,
  description   TEXT,
  cuisine       VARCHAR(300)  NOT NULL COMMENT 'comma-separated',
  cover_image   TEXT,
  logo          TEXT,
  rating        DECIMAL(3,2)  NOT NULL DEFAULT 0.00,
  rating_count  INT           NOT NULL DEFAULT 0,
  delivery_time VARCHAR(30)   NOT NULL DEFAULT '30-40 min',
  delivery_fee  INT           NOT NULL DEFAULT 40,
  min_order     INT           NOT NULL DEFAULT 100,
  price_range   ENUM('₹','₹₹','₹₹₹','₹₹₹₹') NOT NULL DEFAULT '₹₹',
  address       VARCHAR(300),
  city          VARCHAR(100),
  status        ENUM('active','inactive','pending_approval','suspended') NOT NULL DEFAULT 'pending_approval',
  is_open       TINYINT(1)    NOT NULL DEFAULT 1,
  offer         VARCHAR(200),
  tags          VARCHAR(300),
  joined_date   DATE          NOT NULL DEFAULT (CURRENT_DATE),
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── MENU CATEGORIES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_categories (
  id            VARCHAR(36)  NOT NULL PRIMARY KEY,
  restaurant_id VARCHAR(36)  NOT NULL,
  name          VARCHAR(100) NOT NULL,
  sort_order    INT          NOT NULL DEFAULT 0,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- ─── FOODS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS foods (
  id              VARCHAR(36)   NOT NULL PRIMARY KEY,
  restaurant_id   VARCHAR(36)   NOT NULL,
  name            VARCHAR(150)  NOT NULL,
  description     TEXT,
  price           INT           NOT NULL,
  image           TEXT,
  category        VARCHAR(100)  NOT NULL,
  veg_type        ENUM('veg','non-veg','vegan') NOT NULL DEFAULT 'veg',
  rating          DECIMAL(3,2)  NOT NULL DEFAULT 0.00,
  rating_count    INT           NOT NULL DEFAULT 0,
  is_bestseller   TINYINT(1)    NOT NULL DEFAULT 0,
  is_available    TINYINT(1)    NOT NULL DEFAULT 1,
  ingredients     TEXT          COMMENT 'JSON array of strings',
  tags            VARCHAR(300),
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- ─── FOOD CUSTOMIZATIONS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS food_customizations (
  id       VARCHAR(36)  NOT NULL PRIMARY KEY,
  food_id  VARCHAR(36)  NOT NULL,
  name     VARCHAR(100) NOT NULL,
  price    INT          NOT NULL DEFAULT 0,
  FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
);

-- ─── COUPONS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id           VARCHAR(36)   NOT NULL PRIMARY KEY,
  code         VARCHAR(30)   NOT NULL UNIQUE,
  type         ENUM('percentage','flat','free_delivery') NOT NULL,
  value        INT           NOT NULL DEFAULT 0,
  min_order    INT           NOT NULL DEFAULT 0,
  max_discount INT,
  description  VARCHAR(300),
  is_active    TINYINT(1)    NOT NULL DEFAULT 1,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─── CART ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id              VARCHAR(36) NOT NULL PRIMARY KEY,
  user_id         VARCHAR(36) NOT NULL,
  food_id         VARCHAR(36) NOT NULL,
  restaurant_id   VARCHAR(36) NOT NULL,
  quantity        INT         NOT NULL DEFAULT 1,
  customizations  TEXT        COMMENT 'JSON array of {id,name,price}',
  created_at      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)       REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id)       REFERENCES foods(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- ─── ORDERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               VARCHAR(36)  NOT NULL PRIMARY KEY,
  customer_id      VARCHAR(36)  NOT NULL,
  restaurant_id    VARCHAR(36)  NOT NULL,
  subtotal         INT          NOT NULL,
  delivery_fee     INT          NOT NULL DEFAULT 0,
  tax              INT          NOT NULL DEFAULT 0,
  discount         INT          NOT NULL DEFAULT 0,
  total            INT          NOT NULL,
  coupon_code      VARCHAR(30),
  payment_method   ENUM('upi','card','cod') NOT NULL DEFAULT 'cod',
  payment_status   ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  status           ENUM('pending','confirmed','preparing','ready','out_for_delivery','delivered','cancelled') NOT NULL DEFAULT 'pending',
  delivery_address TEXT         NOT NULL COMMENT 'JSON snapshot of address',
  delivery_partner VARCHAR(100),
  estimated_delivery VARCHAR(30),
  placed_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id)  REFERENCES users(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- ─── ORDER ITEMS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id             VARCHAR(36) NOT NULL PRIMARY KEY,
  order_id       VARCHAR(36) NOT NULL,
  food_id        VARCHAR(36) NOT NULL,
  name           VARCHAR(150) NOT NULL,
  image          TEXT,
  quantity       INT         NOT NULL,
  base_price     INT         NOT NULL,
  customizations TEXT        COMMENT 'JSON array',
  item_total     INT         NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ─── ORDER TIMELINE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_timeline (
  id         VARCHAR(36)  NOT NULL PRIMARY KEY,
  order_id   VARCHAR(36)  NOT NULL,
  status     VARCHAR(30)  NOT NULL,
  message    VARCHAR(300) NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ─── FAVORITES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id            VARCHAR(36)  NOT NULL PRIMARY KEY,
  user_id       VARCHAR(36)  NOT NULL,
  type          ENUM('restaurant','food') NOT NULL,
  target_id     VARCHAR(36)  NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_favorite (user_id, type, target_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── REVIEWS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id            VARCHAR(36) NOT NULL PRIMARY KEY,
  order_id      VARCHAR(36) NOT NULL UNIQUE,
  customer_id   VARCHAR(36) NOT NULL,
  restaurant_id VARCHAR(36) NOT NULL,
  rating        TINYINT     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)      REFERENCES orders(id),
  FOREIGN KEY (customer_id)   REFERENCES users(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- ─── NOTIFICATIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         VARCHAR(36)  NOT NULL PRIMARY KEY,
  user_id    VARCHAR(36)  NOT NULL,
  type       ENUM('order','offer','system') NOT NULL DEFAULT 'order',
  title      VARCHAR(200) NOT NULL,
  message    TEXT         NOT NULL,
  is_read    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
