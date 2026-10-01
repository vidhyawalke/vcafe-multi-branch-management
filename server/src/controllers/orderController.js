const db = require('../config/db');

// Place a new order from POS terminal with automatic recipe stock deduction
async function createOrder(req, res) {
  try {
    const {
      branchId,
      customerName = 'Walk-in Guest',
      orderType = 'dine_in',
      tableNumber = 'T-1',
      items,
      paymentMethod = 'upi',
      discountAmount = 0
    } = req.body;

    if (!branchId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'branchId and a non-empty items array are required.'
      });
    }

    // Role check: Staff & Manager can only bill for their assigned branch; Owner can bill any branch
    if (req.user.role !== 'owner' && req.user.branchId !== Number(branchId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only process orders for your assigned branch.'
      });
    }

    // 1. Fetch branch info
    const branch = await db.get(`SELECT * FROM branches WHERE id = $1`, [branchId]);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found.' });
    }

    // 2. Fetch all menu items referenced to verify prices
    const itemIds = items.map((i) => i.menuItemId);
    const placeholders = itemIds.map((_, idx) => '$' + (idx + 1)).join(', ');
    const dbMenuItems = await db.all(
      `SELECT * FROM menu_items WHERE id IN (${placeholders})`,
      itemIds
    );

    const menuMap = {};
    dbMenuItems.forEach((m) => (menuMap[m.id] = m));

    let subtotal = 0;
    const validatedLines = [];

    for (const item of items) {
      const dbItem = menuMap[item.menuItemId];
      if (!dbItem) {
        return res.status(400).json({
          success: false,
          message: `Menu item #${item.menuItemId} does not exist.`
        });
      }

      const qty = parseInt(item.quantity, 10) || 1;
      const unitPrice = Number(dbItem.price);
      const lineSubtotal = unitPrice * qty;
      subtotal += lineSubtotal;

      validatedLines.push({
        menuItemId: dbItem.id,
        name: dbItem.name,
        unitPrice,
        quantity: qty,
        subtotal: lineSubtotal
      });
    }

    const discount = Math.max(0, Number(discountAmount) || 0);
    const taxableAmount = Math.max(0, subtotal - discount);
    const taxAmount = Number((taxableAmount * 0.05).toFixed(2)); // 5% GST
    const totalAmount = Number((taxableAmount + taxAmount).toFixed(2));

    // Generate unique order number (e.g. VC-PAN-1049)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `VC-${branch.code}-${randomSuffix}`;

    // 3. Insert order record
    const insertRes = await db.query(
      `INSERT INTO orders (order_number, branch_id, staff_id, customer_name, order_type, table_number,
                           subtotal, tax_amount, discount_amount, total_amount, payment_method, payment_status, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'completed', 'completed')`,
      [
        orderNumber,
        branchId,
        req.user.id,
        customerName.trim() || 'Walk-in Guest',
        orderType,
        orderType === 'takeaway' ? 'Takeaway' : tableNumber,
        subtotal,
        taxAmount,
        discount,
        totalAmount,
        paymentMethod
      ]
    );

    const orderId = insertRes.insertId;

    // 4. Insert order items & auto-deduct inventory via recipes
    for (const line of validatedLines) {
      await db.query(
        `INSERT INTO order_items (order_id, menu_item_id, item_name, unit_price, quantity, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, line.menuItemId, line.name, line.unitPrice, line.quantity, line.subtotal]
      );

      // Check recipe ingredients
      const ingredients = await db.all(
        `SELECT * FROM menu_item_ingredients WHERE menu_item_id = $1`,
        [line.menuItemId]
      );

      for (const ing of ingredients) {
        const totalDeduction = Number(ing.quantity_required) * line.quantity;

        // Deduct from branch inventory
        await db.query(
          `UPDATE branch_inventory
           SET current_stock = MAX(0, current_stock - $1)
           WHERE branch_id = $2 AND inventory_item_id = $3`,
          [totalDeduction, branchId, ing.inventory_item_id]
        );

        // Record inventory deduction log
        await db.query(
          `INSERT INTO inventory_logs (branch_id, inventory_item_id, user_id, change_amount, type, notes)
           VALUES ($1, $2, $3, $4, 'order_deduction', $5)`,
          [
            branchId,
            ing.inventory_item_id,
            req.user.id,
            -totalDeduction,
            `Order #${orderNumber} (${line.quantity}x ${line.name})`
          ]
        );
      }
    }

    // Return receipt-ready payload
    return res.status(201).json({
      success: true,
      message: 'Order processed and billed successfully.',
      data: {
        orderId,
        orderNumber,
        branch: {
          name: branch.name,
          address: branch.address,
          phone: branch.phone,
          gstin: branch.gstin
        },
        staffName: req.user.name,
        customerName,
        orderType,
        tableNumber: orderType === 'takeaway' ? 'Takeaway' : tableNumber,
        items: validatedLines,
        subtotal,
        discountAmount: discount,
        taxAmount,
        totalAmount,
        paymentMethod,
        createdAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Order creation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process order.' });
  }
}

// Get order history (with branch and date filtering)
async function getOrders(req, res) {
  try {
    const { branchId, limit = 50, page = 1 } = req.query;

    let targetBranchId = branchId;
    if (req.user.role !== 'owner' && !targetBranchId) {
      targetBranchId = req.user.branchId;
    }

    let sql = `
      SELECT o.*, b.name as branch_name, b.code as branch_code, u.name as staff_name
      FROM orders o
      JOIN branches b ON o.branch_id = b.id
      JOIN users u ON o.staff_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (targetBranchId) {
      sql += ' AND o.branch_id = $' + (params.length + 1);
      params.push(targetBranchId);
    }

    sql += ' ORDER BY o.created_at DESC LIMIT $' + (params.length + 1);
    params.push(Number(limit));

    const orders = await db.all(sql, params);

    // Fetch items for these orders
    for (const order of orders) {
      order.items = await db.all(
        `SELECT * FROM order_items WHERE order_id = $1`,
        [order.id]
      );
    }

    return res.json({ success: true, data: orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
}

// Get single order receipt detail
async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const order = await db.get(
      `SELECT o.*, b.name as branch_name, b.address as branch_address, b.phone as branch_phone, b.gstin as branch_gstin,
              u.name as staff_name
       FROM orders o
       JOIN branches b ON o.branch_id = b.id
       JOIN users u ON o.staff_id = u.id
       WHERE o.id = $1`,
      [id]
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.items = await db.all(`SELECT * FROM order_items WHERE order_id = $1`, [order.id]);

    return res.json({ success: true, data: order });
  } catch (err) {
    console.error('Error fetching order:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch order details.' });
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById
};
