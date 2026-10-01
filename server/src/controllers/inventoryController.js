const db = require('../config/db');

// Get inventory items for a branch (or all branches for owner)
async function getInventory(req, res) {
  try {
    const { branchId, lowStockOnly } = req.query;

    let targetBranchId = branchId;
    // If not owner and no branch specified, default to user's branch
    if (req.user.role !== 'owner' && !targetBranchId) {
      targetBranchId = req.user.branchId;
    }

    let sql = `
      SELECT bi.id, bi.branch_id, bi.current_stock, bi.min_threshold, bi.cost_per_unit, bi.last_restocked_at,
             b.name as branch_name, b.code as branch_code,
             ii.id as inventory_item_id, ii.name as item_name, ii.unit, ii.category,
             CASE WHEN bi.current_stock <= bi.min_threshold THEN 1 ELSE 0 END as is_low_stock
      FROM branch_inventory bi
      JOIN inventory_items ii ON bi.inventory_item_id = ii.id
      JOIN branches b ON bi.branch_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (targetBranchId) {
      sql += ' AND bi.branch_id = $' + (params.length + 1);
      params.push(targetBranchId);
    }

    if (lowStockOnly === 'true') {
      sql += ' AND bi.current_stock <= bi.min_threshold';
    }

    sql += ' ORDER BY is_low_stock DESC, ii.category ASC, ii.name ASC';

    const items = await db.all(sql, params);
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('Error fetching inventory:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch inventory data.' });
  }
}

// Adjust stock level (Restock or Waste)
async function adjustStock(req, res) {
  try {
    const { branchId, inventoryItemId, changeAmount, type, notes } = req.body;

    if (!branchId || !inventoryItemId || changeAmount === undefined || !type) {
      return res.status(400).json({
        success: false,
        message: 'branchId, inventoryItemId, changeAmount, and type are required.'
      });
    }

    // Role verification: only owner or that branch's manager can adjust
    if (req.user.role !== 'owner' && req.user.branchId !== Number(branchId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to adjust inventory for this branch.'
      });
    }

    // 1. Check current inventory record
    const existing = await db.get(
      `SELECT * FROM branch_inventory WHERE branch_id = $1 AND inventory_item_id = $2`,
      [branchId, inventoryItemId]
    );

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Branch inventory record not found.' });
    }

    const newStock = Math.max(0, Number(existing.current_stock) + Number(changeAmount));

    // 2. Update stock level
    await db.query(
      `UPDATE branch_inventory
       SET current_stock = $1, last_restocked_at = CURRENT_TIMESTAMP
       WHERE branch_id = $2 AND inventory_item_id = $3`,
      [newStock, branchId, inventoryItemId]
    );

    // 3. Insert audit log
    await db.query(
      `INSERT INTO inventory_logs (branch_id, inventory_item_id, user_id, change_amount, type, notes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        branchId,
        inventoryItemId,
        req.user.id,
        changeAmount,
        type,
        notes || (changeAmount > 0 ? 'Stock replenished' : 'Stock adjusted')
      ]
    );

    return res.json({
      success: true,
      message: `Stock updated successfully. New level: ${newStock}`,
      data: {
        branchId,
        inventoryItemId,
        previousStock: existing.current_stock,
        newStock
      }
    });
  } catch (err) {
    console.error('Error adjusting stock:', err);
    return res.status(500).json({ success: false, message: 'Failed to adjust stock.' });
  }
}

// Inter-branch stock transfer (e.g. Panjim -> Anjuna)
async function transferStock(req, res) {
  try {
    const { fromBranchId, toBranchId, inventoryItemId, quantity, notes } = req.body;

    if (!fromBranchId || !toBranchId || !inventoryItemId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Source branch, destination branch, item, and valid quantity are required.'
      });
    }

    if (fromBranchId === toBranchId) {
      return res.status(400).json({ success: false, message: 'Source and destination branches must be different.' });
    }

    // Role check: Only owner or source branch manager can authorize transfer out
    if (req.user.role !== 'owner' && req.user.branchId !== Number(fromBranchId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to transfer stock from this branch.' });
    }

    // Check source stock
    const sourceRecord = await db.get(
      `SELECT * FROM branch_inventory WHERE branch_id = $1 AND inventory_item_id = $2`,
      [fromBranchId, inventoryItemId]
    );

    if (!sourceRecord || Number(sourceRecord.current_stock) < Number(quantity)) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock at source branch. Available: ${sourceRecord ? sourceRecord.current_stock : 0}`
      });
    }

    // Deduct from source branch
    const newSourceStock = Number(sourceRecord.current_stock) - Number(quantity);
    await db.query(
      `UPDATE branch_inventory SET current_stock = $1 WHERE branch_id = $2 AND inventory_item_id = $3`,
      [newSourceStock, fromBranchId, inventoryItemId]
    );

    // Add to destination branch
    const destRecord = await db.get(
      `SELECT * FROM branch_inventory WHERE branch_id = $1 AND inventory_item_id = $2`,
      [toBranchId, inventoryItemId]
    );

    if (destRecord) {
      const newDestStock = Number(destRecord.current_stock) + Number(quantity);
      await db.query(
        `UPDATE branch_inventory SET current_stock = $1 WHERE branch_id = $2 AND inventory_item_id = $3`,
        [newDestStock, toBranchId, inventoryItemId]
      );
    } else {
      await db.query(
        `INSERT INTO branch_inventory (branch_id, inventory_item_id, current_stock, min_threshold, cost_per_unit)
         VALUES ($1, $2, $3, $4, $5)`,
        [toBranchId, inventoryItemId, quantity, 5.0, sourceRecord.cost_per_unit || 0]
      );
    }

    // Log both ends of the transfer
    const auditNote = notes || `Inter-branch transfer of ${quantity} units`;
    await db.query(
      `INSERT INTO inventory_logs (branch_id, inventory_item_id, user_id, change_amount, type, notes)
       VALUES ($1, $2, $3, $4, 'transfer_out', $5)`,
      [fromBranchId, inventoryItemId, req.user.id, -Math.abs(quantity), `Transferred to branch #${toBranchId}: ${auditNote}`]
    );

    await db.query(
      `INSERT INTO inventory_logs (branch_id, inventory_item_id, user_id, change_amount, type, notes)
       VALUES ($1, $2, $3, $4, 'transfer_in', $5)`,
      [toBranchId, inventoryItemId, req.user.id, Math.abs(quantity), `Received from branch #${fromBranchId}: ${auditNote}`]
    );

    return res.json({
      success: true,
      message: `Successfully transferred ${quantity} units between branches.`
    });
  } catch (err) {
    console.error('Error transferring stock:', err);
    return res.status(500).json({ success: false, message: 'Failed to complete stock transfer.' });
  }
}

// Get recent inventory logs / audit history
async function getInventoryLogs(req, res) {
  try {
    const { branchId, limit = 20 } = req.query;

    let sql = `
      SELECT il.*, b.name as branch_name, b.code as branch_code,
             ii.name as item_name, ii.unit,
             u.name as performed_by
      FROM inventory_logs il
      JOIN branches b ON il.branch_id = b.id
      JOIN inventory_items ii ON il.inventory_item_id = ii.id
      LEFT JOIN users u ON il.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (branchId) {
      sql += ' AND il.branch_id = $' + (params.length + 1);
      params.push(branchId);
    }

    sql += ' ORDER BY il.created_at DESC LIMIT $' + (params.length + 1);
    params.push(Number(limit));

    const logs = await db.all(sql, params);
    return res.json({ success: true, data: logs });
  } catch (err) {
    console.error('Error fetching inventory logs:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch inventory logs.' });
  }
}

module.exports = {
  getInventory,
  adjustStock,
  transferStock,
  getInventoryLogs
};
