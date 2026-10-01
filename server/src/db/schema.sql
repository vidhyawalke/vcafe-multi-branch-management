-- =============================================================================
-- VCafe Multi-Branch Management System - Database DDL Schema
-- Compatible with PostgreSQL (Production) and SQLite (Local Development)
-- Author: Vidhya Walke
-- =============================================================================

-- 1. Branches Table
CREATE TABLE IF NOT EXISTS branches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(50) NOT NULL DEFAULT 'Goa',
  phone VARCHAR(20) NOT NULL,
  gstin VARCHAR(30),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (Role-based access: owner, manager, staff)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  branch_id INTEGER,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'manager', 'staff')),
  phone VARCHAR(20),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);

-- 3. Menu Categories
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(80) NOT NULL UNIQUE,
  slug VARCHAR(80) NOT NULL,
  icon VARCHAR(50) DEFAULT 'coffee',
  display_order INTEGER DEFAULT 0
);

-- 4. Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  image_url TEXT,
  is_available INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 5. Inventory Raw Material Items
CREATE TABLE IF NOT EXISTS inventory_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(120) NOT NULL UNIQUE,
  unit VARCHAR(20) NOT NULL, -- 'kg', 'liters', 'units', 'packets'
  category VARCHAR(50) NOT NULL, -- 'Beans', 'Dairy', 'Bakery', 'Packaging', 'Syrup'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Branch Specific Inventory Levels
CREATE TABLE IF NOT EXISTS branch_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  branch_id INTEGER NOT NULL,
  inventory_item_id INTEGER NOT NULL,
  current_stock DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  min_threshold DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
  cost_per_unit DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  last_restocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(branch_id, inventory_item_id),
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
);

-- 7. Recipe Mapping (Menu item -> Inventory ingredients for auto-deduction)
CREATE TABLE IF NOT EXISTS menu_item_ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  menu_item_id INTEGER NOT NULL,
  inventory_item_id INTEGER NOT NULL,
  quantity_required DECIMAL(10, 3) NOT NULL,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
  FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
);

-- 8. Customer Orders
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number VARCHAR(30) UNIQUE NOT NULL,
  branch_id INTEGER NOT NULL,
  staff_id INTEGER NOT NULL,
  customer_name VARCHAR(100) DEFAULT 'Walk-in Guest',
  order_type VARCHAR(20) NOT NULL DEFAULT 'dine_in' CHECK (order_type IN ('dine_in', 'takeaway')),
  table_number VARCHAR(10) DEFAULT 'T-1',
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card', 'upi')),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'completed',
  status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'preparing', 'cancelled')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (staff_id) REFERENCES users(id)
);

-- 9. Order Line Items
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  menu_item_id INTEGER NOT NULL,
  item_name VARCHAR(120) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- 10. Inventory Audit Logs & Stock Movements
CREATE TABLE IF NOT EXISTS inventory_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  branch_id INTEGER NOT NULL,
  inventory_item_id INTEGER NOT NULL,
  user_id INTEGER,
  change_amount DECIMAL(10, 2) NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('order_deduction', 'manual_restock', 'spoilage_waste', 'transfer_in', 'transfer_out')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_orders_branch ON orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_branch_inventory ON branch_inventory(branch_id, inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
