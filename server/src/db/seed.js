const bcrypt = require('bcryptjs');
const db = require('../config/db');
const initializeDatabase = require('./initDb');

async function seed() {
  await initializeDatabase();
  console.log('🌱 Seeding VCafe demo data...');

  // Check if already seeded
  const existingBranches = await db.all('SELECT * FROM branches');
  if (existingBranches.length > 0) {
    console.log('ℹ️ Database already has data. Skipping re-seed.');
    return;
  }

  // 1. Insert Branches
  await db.query(
    `INSERT INTO branches (name, code, address, city, phone, gstin) VALUES
     ($1, $2, $3, $4, $5, $6)`,
    ['VCafe Panjim (Flagship)', 'PAN', 'MG Road, Altinho, Panjim, Goa 403001', 'Panjim', '+91 832 242 1890', '30AABCV1234F1Z5']
  );

  await db.query(
    `INSERT INTO branches (name, code, address, city, phone, gstin) VALUES
     ($1, $2, $3, $4, $5, $6)`,
    ['VCafe Anjuna (Beachside)', 'ANJ', 'Anjuna Flea Market Rd, Anjuna, Goa 403509', 'Anjuna', '+91 832 227 4511', '30AABCV1234F1Z5']
  );

  const branches = await db.all('SELECT * FROM branches');
  const panjimId = branches.find((b) => b.code === 'PAN').id;
  const anjunaId = branches.find((b) => b.code === 'ANJ').id;

  // 2. Insert Users (Password: admin123, manager123, staff123)
  const salt = await bcrypt.genSalt(10);
  const ownerPass = await bcrypt.hash('admin123', salt);
  const managerPass = await bcrypt.hash('manager123', salt);
  const staffPass = await bcrypt.hash('staff123', salt);

  await db.query(
    `INSERT INTO users (branch_id, name, email, password_hash, role, phone) VALUES
     (NULL, $1, $2, $3, $4, $5)`,
    ['Vidhya Walke', 'owner@vcafe.com', ownerPass, 'owner', '+91 93732 98187']
  );

  await db.query(
    `INSERT INTO users (branch_id, name, email, password_hash, role, phone) VALUES
     ($1, $2, $3, $4, $5, $6)`,
    [panjimId, 'Rahul Deshmukh', 'manager.panjim@vcafe.com', managerPass, 'manager', '+91 98221 44550']
  );

  await db.query(
    `INSERT INTO users (branch_id, name, email, password_hash, role, phone) VALUES
     ($1, $2, $3, $4, $5, $6)`,
    [anjunaId, 'Maria Fernandes', 'manager.anjuna@vcafe.com', managerPass, 'manager', '+91 98221 77881']
  );

  await db.query(
    `INSERT INTO users (branch_id, name, email, password_hash, role, phone) VALUES
     ($1, $2, $3, $4, $5, $6)`,
    [panjimId, 'Priya Sharma', 'staff.panjim@vcafe.com', staffPass, 'staff', '+91 91580 33211']
  );

  await db.query(
    `INSERT INTO users (branch_id, name, email, password_hash, role, phone) VALUES
     ($1, $2, $3, $4, $5, $6)`,
    [anjunaId, 'Kevin Lobo', 'staff.anjuna@vcafe.com', staffPass, 'staff', '+91 91580 99422']
  );

  // 3. Categories
  const categoriesList = [
    { name: 'Espresso & Classics', slug: 'espresso', icon: 'coffee', display_order: 1 },
    { name: 'Cold Brews & Iced Lattes', slug: 'cold-brews', icon: 'cup-soda', display_order: 2 },
    { name: 'Artisanal Bakery', slug: 'bakery', icon: 'croissant', display_order: 3 },
    { name: 'Gourmet Bites & Toasts', slug: 'bites', icon: 'sandwich', display_order: 4 }
  ];

  for (const cat of categoriesList) {
    await db.query(
      `INSERT INTO categories (name, slug, icon, display_order) VALUES ($1, $2, $3, $4)`,
      [cat.name, cat.slug, cat.icon, cat.display_order]
    );
  }

  const allCats = await db.all('SELECT * FROM categories');
  const catMap = {};
  allCats.forEach((c) => (catMap[c.slug] = c.id));

  // 4. Menu Items
  const menuItems = [
    {
      cat: 'espresso',
      name: 'Signature Flat White',
      desc: 'Double shot Arabica ristretto with velvety microfoam',
      price: 220.0,
      cost: 55.0,
      img: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=500&auto=format&fit=crop&q=60'
    },
    {
      cat: 'espresso',
      name: 'Classic Cappuccino',
      desc: 'Bold espresso balanced with steamed milk and dense silky foam',
      price: 210.0,
      cost: 50.0,
      img: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=60'
    },
    {
      cat: 'espresso',
      name: 'Spanish Cortado',
      desc: 'Equal parts espresso and warm condensed milk for a rich sweet kick',
      price: 230.0,
      cost: 60.0,
      img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60'
    },
    {
      cat: 'cold-brews',
      name: 'Vanilla Sweet Cream Cold Brew',
      desc: '16-hour steeped slow brew topped with house-made Madagascar vanilla cream',
      price: 260.0,
      cost: 68.0,
      img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=60'
    },
    {
      cat: 'cold-brews',
      name: 'Iced Oat Milk Caramel Macchiato',
      desc: 'Chilled barista oat milk, dark roast espresso float, salted caramel drizzle',
      price: 280.0,
      cost: 85.0,
      img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&auto=format&fit=crop&q=60'
    },
    {
      cat: 'bakery',
      name: 'Flaky Pure Butter Croissant',
      desc: 'Hand-laminated French butter croissant baked fresh daily every morning',
      price: 180.0,
      cost: 60.0,
      img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60'
    },
    {
      cat: 'bakery',
      name: 'Almond Frangipane Brioche',
      desc: 'Golden toasted brioche stuffed with almond cream and sliced almonds',
      price: 240.0,
      cost: 80.0,
      img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60'
    },
    {
      cat: 'bites',
      name: 'Truffle Mushroom Sourdough',
      desc: 'Wild sautéed portobello mushrooms, garlic confit, whipped feta on sourdough',
      price: 340.0,
      cost: 110.0,
      img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=60'
    },
    {
      cat: 'bites',
      name: 'Smoked Chicken & Basil Pesto Panini',
      desc: 'Herb chicken breast, fresh pine nut pesto, sundried tomatoes & mozzarella',
      price: 360.0,
      cost: 120.0,
      img: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60'
    }
  ];

  for (const item of menuItems) {
    await db.query(
      `INSERT INTO menu_items (category_id, name, description, price, cost_price, image_url, is_available)
       VALUES ($1, $2, $3, $4, $5, $6, 1)`,
      [catMap[item.cat], item.name, item.desc, item.price, item.cost, item.img]
    );
  }

  // 5. Inventory Raw Material Items
  const inventoryItems = [
    { name: 'Single Origin Arabica Beans', unit: 'kg', category: 'Beans' },
    { name: 'Full Cream Cow Milk', unit: 'liters', category: 'Dairy' },
    { name: 'Barista Edition Oat Milk', unit: 'liters', category: 'Dairy' },
    { name: 'Madagascar Vanilla Syrup', unit: 'ml', category: 'Syrups' },
    { name: 'Salted Caramel Sauce', unit: 'kg', category: 'Syrups' },
    { name: 'Butter Croissant Dough Units', unit: 'units', category: 'Bakery' },
    { name: 'Artisanal Sourdough Loaf', unit: 'units', category: 'Bakery' },
    { name: 'Portobello Mushrooms', unit: 'kg', category: 'Produce' },
    { name: 'Paper Takeaway Cups 350ml', unit: 'units', category: 'Packaging' }
  ];

  for (const inv of inventoryItems) {
    await db.query(
      `INSERT INTO inventory_items (name, unit, category) VALUES ($1, $2, $3)`,
      [inv.name, inv.unit, inv.category]
    );
  }

  const allInv = await db.all('SELECT * FROM inventory_items');
  const invMap = {};
  allInv.forEach((i) => (invMap[i.name] = i.id));

  // 6. Branch Inventory (Panjim vs Anjuna stock levels)
  // Panjim has robust stock; Anjuna has low Oat Milk & Mushrooms to demonstrate alerts!
  const stockSeed = [
    // Panjim
    { branchId: panjimId, name: 'Single Origin Arabica Beans', stock: 18.5, min: 5.0, cost: 750 },
    { branchId: panjimId, name: 'Full Cream Cow Milk', stock: 45.0, min: 15.0, cost: 65 },
    { branchId: panjimId, name: 'Barista Edition Oat Milk', stock: 22.0, min: 8.0, cost: 220 },
    { branchId: panjimId, name: 'Madagascar Vanilla Syrup', stock: 2500, min: 500, cost: 0.8 },
    { branchId: panjimId, name: 'Salted Caramel Sauce', stock: 4.5, min: 1.5, cost: 450 },
    { branchId: panjimId, name: 'Butter Croissant Dough Units', stock: 35, min: 10, cost: 45 },
    { branchId: panjimId, name: 'Artisanal Sourdough Loaf', stock: 12, min: 4, cost: 60 },
    { branchId: panjimId, name: 'Portobello Mushrooms', stock: 6.0, min: 2.0, cost: 300 },
    { branchId: panjimId, name: 'Paper Takeaway Cups 350ml', stock: 450, min: 100, cost: 4.5 },

    // Anjuna (Intentional low-stock items for demo)
    { branchId: anjunaId, name: 'Single Origin Arabica Beans', stock: 8.2, min: 5.0, cost: 750 },
    { branchId: anjunaId, name: 'Full Cream Cow Milk', stock: 28.0, min: 12.0, cost: 65 },
    { branchId: anjunaId, name: 'Barista Edition Oat Milk', stock: 3.5, min: 8.0, cost: 220 }, // LOW STOCK!
    { branchId: anjunaId, name: 'Madagascar Vanilla Syrup', stock: 650, min: 400, cost: 0.8 },
    { branchId: anjunaId, name: 'Salted Caramel Sauce', stock: 1.8, min: 1.5, cost: 450 },
    { branchId: anjunaId, name: 'Butter Croissant Dough Units', stock: 18, min: 8, cost: 45 },
    { branchId: anjunaId, name: 'Artisanal Sourdough Loaf', stock: 2, min: 4, cost: 60 }, // LOW STOCK!
    { branchId: anjunaId, name: 'Portobello Mushrooms', stock: 1.2, min: 2.0, cost: 300 }, // LOW STOCK!
    { branchId: anjunaId, name: 'Paper Takeaway Cups 350ml', stock: 210, min: 80, cost: 4.5 }
  ];

  for (const s of stockSeed) {
    const itemId = invMap[s.name];
    if (itemId) {
      await db.query(
        `INSERT INTO branch_inventory (branch_id, inventory_item_id, current_stock, min_threshold, cost_per_unit)
         VALUES ($1, $2, $3, $4, $5)`,
        [s.branchId, itemId, s.stock, s.min, s.cost]
      );
    }
  }

  // 7. Recipe ingredients mapping for auto-deduction
  const allMenuItems = await db.all('SELECT * FROM menu_items');
  const getMenuItemId = (name) => allMenuItems.find((m) => m.name === name)?.id;

  const recipes = [
    { menuName: 'Signature Flat White', invName: 'Single Origin Arabica Beans', qty: 0.018 },
    { menuName: 'Signature Flat White', invName: 'Full Cream Cow Milk', qty: 0.20 },
    { menuName: 'Classic Cappuccino', invName: 'Single Origin Arabica Beans', qty: 0.018 },
    { menuName: 'Classic Cappuccino', invName: 'Full Cream Cow Milk', qty: 0.22 },
    { menuName: 'Vanilla Sweet Cream Cold Brew', invName: 'Single Origin Arabica Beans', qty: 0.025 },
    { menuName: 'Vanilla Sweet Cream Cold Brew', invName: 'Madagascar Vanilla Syrup', qty: 25 },
    { menuName: 'Iced Oat Milk Caramel Macchiato', invName: 'Barista Edition Oat Milk', qty: 0.24 },
    { menuName: 'Iced Oat Milk Caramel Macchiato', invName: 'Salted Caramel Sauce', qty: 0.03 },
    { menuName: 'Flaky Pure Butter Croissant', invName: 'Butter Croissant Dough Units', qty: 1 },
    { menuName: 'Truffle Mushroom Sourdough', invName: 'Artisanal Sourdough Loaf', qty: 0.25 },
    { menuName: 'Truffle Mushroom Sourdough', invName: 'Portobello Mushrooms', qty: 0.15 }
  ];

  for (const r of recipes) {
    const mId = getMenuItemId(r.menuName);
    const iId = invMap[r.invName];
    if (mId && iId) {
      await db.query(
        `INSERT INTO menu_item_ingredients (menu_item_id, inventory_item_id, quantity_required)
         VALUES ($1, $2, $3)`,
        [mId, iId, r.qty]
      );
    }
  }

  // 8. Generate Realistic Orders over past 3 days for authentic charts and analytics!
  const staffPanjim = await db.get(`SELECT id FROM users WHERE email = 'staff.panjim@vcafe.com'`);
  const staffAnjuna = await db.get(`SELECT id FROM users WHERE email = 'staff.anjuna@vcafe.com'`);

  const mockPastOrders = [
    {
      branchId: panjimId,
      staffId: staffPanjim.id,
      customer: 'Aarav Mehta',
      type: 'dine_in',
      table: 'T-4',
      items: [{ name: 'Classic Cappuccino', qty: 2 }, { name: 'Flaky Pure Butter Croissant', qty: 2 }],
      payMethod: 'upi',
      hoursAgo: 2
    },
    {
      branchId: panjimId,
      staffId: staffPanjim.id,
      customer: 'Sneha Patel',
      type: 'takeaway',
      table: '-',
      items: [{ name: 'Signature Flat White', qty: 1 }, { name: 'Truffle Mushroom Sourdough', qty: 1 }],
      payMethod: 'card',
      hoursAgo: 4
    },
    {
      branchId: anjunaId,
      staffId: staffAnjuna.id,
      customer: 'Liam Walker (Tourist)',
      type: 'dine_in',
      table: 'Sea-2',
      items: [{ name: 'Vanilla Sweet Cream Cold Brew', qty: 2 }, { name: 'Almond Frangipane Brioche', qty: 2 }],
      payMethod: 'card',
      hoursAgo: 1
    },
    {
      branchId: anjunaId,
      staffId: staffAnjuna.id,
      customer: 'Rhea Sen',
      type: 'dine_in',
      table: 'Sea-5',
      items: [{ name: 'Iced Oat Milk Caramel Macchiato', qty: 1 }, { name: 'Smoked Chicken & Basil Pesto Panini', qty: 1 }],
      payMethod: 'upi',
      hoursAgo: 3
    },
    {
      branchId: panjimId,
      staffId: staffPanjim.id,
      customer: 'Dr. Rohan Kamat',
      type: 'dine_in',
      table: 'T-2',
      items: [{ name: 'Spanish Cortado', qty: 2 }, { name: 'Flaky Pure Butter Croissant', qty: 1 }],
      payMethod: 'cash',
      hoursAgo: 7
    },
    {
      branchId: anjunaId,
      staffId: staffAnjuna.id,
      customer: 'Elena Rostova',
      type: 'takeaway',
      table: '-',
      items: [{ name: 'Vanilla Sweet Cream Cold Brew', qty: 3 }],
      payMethod: 'upi',
      hoursAgo: 10
    },
    {
      branchId: panjimId,
      staffId: staffPanjim.id,
      customer: 'Pooja Naik',
      type: 'dine_in',
      table: 'T-6',
      items: [{ name: 'Smoked Chicken & Basil Pesto Panini', qty: 2 }, { name: 'Classic Cappuccino', qty: 2 }],
      payMethod: 'card',
      hoursAgo: 24
    },
    {
      branchId: anjunaId,
      staffId: staffAnjuna.id,
      customer: 'Mark Henderson',
      type: 'dine_in',
      table: 'Sea-1',
      items: [{ name: 'Signature Flat White', qty: 2 }, { name: 'Truffle Mushroom Sourdough', qty: 2 }],
      payMethod: 'cash',
      hoursAgo: 26
    }
  ];

  let orderCount = 100;
  for (const o of mockPastOrders) {
    orderCount++;
    const branchCode = o.branchId === panjimId ? 'PAN' : 'ANJ';
    const orderNumber = `VC-${branchCode}-${orderCount}`;

    let subtotal = 0;
    const resolvedItems = [];
    for (const line of o.items) {
      const item = allMenuItems.find((m) => m.name === line.name);
      if (item) {
        const lineSubtotal = Number(item.price) * line.qty;
        subtotal += lineSubtotal;
        resolvedItems.push({
          menuItemId: item.id,
          name: item.name,
          unitPrice: item.price,
          qty: line.qty,
          subtotal: lineSubtotal
        });
      }
    }

    const taxAmount = Number((subtotal * 0.05).toFixed(2)); // 5% GST
    const totalAmount = Number((subtotal + taxAmount).toFixed(2));

    // Calculate created_at
    const orderDate = new Date(Date.now() - o.hoursAgo * 60 * 60 * 1000).toISOString();

    const orderRes = await db.query(
      `INSERT INTO orders (order_number, branch_id, staff_id, customer_name, order_type, table_number, subtotal, tax_amount, discount_amount, total_amount, payment_method, payment_status, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        orderNumber,
        o.branchId,
        o.staffId,
        o.customer,
        o.type,
        o.table,
        subtotal,
        taxAmount,
        0,
        totalAmount,
        o.payMethod,
        'completed',
        'completed',
        orderDate
      ]
    );

    const orderId = orderRes.insertId || orderCount;
    for (const ri of resolvedItems) {
      await db.query(
        `INSERT INTO order_items (order_id, menu_item_id, item_name, unit_price, quantity, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, ri.menuItemId, ri.name, ri.unitPrice, ri.qty, ri.subtotal]
      );
    }
  }

  console.log('✅ Demo seed completed successfully with branches, staff, menu, recipes, and sample orders.');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding error:', err);
      process.exit(1);
    });
}

module.exports = seed;
