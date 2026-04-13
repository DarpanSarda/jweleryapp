-- ============================================
-- vezura E-commerce Database - Initial Schema
-- Migration: 001_initial_schema
-- Description: Creates all core tables for the e-commerce system
-- ============================================

-- Enable foreign key constraints (for SQLite, adjust for MySQL/PostgreSQL)
PRAGMA foreign_keys = ON;

-- ============================================
-- 1. PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    emoji VARCHAR(10),
    slug VARCHAR(255) UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    category VARCHAR(100),
    image_url TEXT NOT NULL,
    description TEXT,
    is_sold BOOLEAN DEFAULT false,
    stock_quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster category lookups
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_sold ON products(is_sold);

-- ============================================
-- 2. CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_phone ON customers(phone);

-- ============================================
-- 3. ADDRESSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS addresses (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    pincode VARCHAR(10) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX idx_addresses_customer_id ON addresses(customer_id);
CREATE INDEX idx_addresses_pincode ON addresses(pincode);

-- ============================================
-- 4. SHIPPING ZONES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS shipping_zones (
    id INT PRIMARY KEY AUTOINCREMENT,
    zone_name VARCHAR(100) NOT NULL,
    description TEXT,
    countries JSON,          -- ["India"]
    states JSON,             -- ["MH", "KA", "DL"]
    cities JSON,             -- ["Mumbai", "Bangalore"]
    pincode_ranges JSON,     -- [["400001", "400100"], ["560001", "560100"]]
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. SHIPPING CARRIERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS shipping_carriers (
    id INT PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,           -- "Shiprocket", "Delhivery", "Bluedart"
    api_key VARCHAR(255),
    api_endpoint VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    supports_cod BOOLEAN DEFAULT true,
    estimated_days_base INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. SHIPPING METHODS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS shipping_methods (
    id INT PRIMARY KEY AUTOINCREMENT,
    carrier_id INT NOT NULL,
    method_name VARCHAR(50) NOT NULL,     -- "Standard", "Express", "Overnight"
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (carrier_id) REFERENCES shipping_carriers(id)
);

-- ============================================
-- 7. DELIVERY CHARGE RULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS delivery_charge_rules (
    id INT PRIMARY KEY AUTOINCREMENT,
    zone_id INT,
    method_id INT,

    -- Order value based rules
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_order_amount DECIMAL(10, 2),

    -- Weight based rules (optional)
    min_weight DECIMAL(10, 2),
    max_weight DECIMAL(10, 2),
    price_per_unit_weight DECIMAL(10, 2),

    -- Charge calculation
    base_charge DECIMAL(10, 2) NOT NULL,
    additional_charge DECIMAL(10, 2) DEFAULT 0,
    free_shipping_above DECIMAL(10, 2),

    -- Other charges
    cod_charge DECIMAL(10, 2) DEFAULT 0,

    -- Configuration
    is_active BOOLEAN DEFAULT true,
    priority INT DEFAULT 0,
    valid_from DATE,
    valid_till DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (zone_id) REFERENCES shipping_zones(id),
    FOREIGN KEY (method_id) REFERENCES shipping_methods(id)
);

CREATE INDEX idx_delivery_rules_zone ON delivery_charge_rules(zone_id);
CREATE INDEX idx_delivery_rules_method ON delivery_charge_rules(method_id);

-- ============================================
-- 8. PINCODE SERVICEABILITY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pincode_serviceability (
    id INT PRIMARY KEY AUTOINCREMENT,
    pincode VARCHAR(10) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zone_id INT,
    is_cod_available BOOLEAN DEFAULT true,
    is_prepaid_available BOOLEAN DEFAULT true,
    estimated_delivery_days INT DEFAULT 3,
    courier_partners JSON,          -- ["Delhivery", "Bluedart", "Shiprocket"]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES shipping_zones(id)
);

CREATE INDEX idx_pincode_serviceability_pincode ON pincode_serviceability(pincode);
CREATE INDEX idx_pincode_serviceability_city ON pincode_serviceability(city);

-- ============================================
-- 9. ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    delivery_charge DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'COD',    -- 'COD', 'Prepaid', 'UPI'
    status VARCHAR(50) DEFAULT 'pending',        -- 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'

    -- Shipping details (stored for order history)
    shipping_name VARCHAR(255) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100),
    shipping_pincode VARCHAR(10) NOT NULL,

    -- Additional information
    customer_notes TEXT,
    admin_notes TEXT,
    whatsapp_message_sent BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ============================================
-- 10. ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36),
    product_name VARCHAR(255) NOT NULL,
    product_emoji VARCHAR(10),
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ============================================
-- 11. CATEGORIES TABLE (Optional - for dynamic categories)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    emoji VARCHAR(10),
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 12. CART TABLE (For persistent cart - optional)
-- ============================================
CREATE TABLE IF NOT EXISTS carts (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36),
    session_id VARCHAR(255),           -- For guest users
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX idx_carts_customer_id ON carts(customer_id);
CREATE INDEX idx_carts_session_id ON carts(session_id);

-- ============================================
-- 13. WISHLIST TABLE (For persistent wishlist - optional)
-- ============================================
CREATE TABLE IF NOT EXISTS wishlist (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36),
    product_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    UNIQUE(customer_id, product_id)
);

CREATE INDEX idx_wishlist_customer_id ON wishlist(customer_id);
CREATE INDEX idx_wishlist_product_id ON wishlist(product_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Products table trigger
CREATE TRIGGER IF NOT EXISTS update_products_timestamp
AFTER UPDATE ON products
BEGIN
    UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Customers table trigger
CREATE TRIGGER IF NOT EXISTS update_customers_timestamp
AFTER UPDATE ON customers
BEGIN
    UPDATE customers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Orders table trigger
CREATE TRIGGER IF NOT EXISTS update_orders_timestamp
AFTER UPDATE ON orders
BEGIN
    UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Delivery charge rules trigger
CREATE TRIGGER IF NOT EXISTS update_delivery_rules_timestamp
AFTER UPDATE ON delivery_charge_rules
BEGIN
    UPDATE delivery_charge_rules SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Carts table trigger
CREATE TRIGGER IF NOT EXISTS update_carts_timestamp
AFTER UPDATE ON carts
BEGIN
    UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================
-- END OF MIGRATION
-- ============================================
