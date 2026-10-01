const db = require('../config/db');

async function getAllBranches(req, res) {
  try {
    const branches = await db.all(`
      SELECT b.*,
        (SELECT COUNT(*) FROM users u WHERE u.branch_id = b.id AND u.is_active = 1) as staff_count,
        (SELECT COUNT(*) FROM orders o WHERE o.branch_id = b.id AND o.status = 'completed') as total_orders,
        COALESCE((SELECT SUM(o.total_amount) FROM orders o WHERE o.branch_id = b.id AND o.status = 'completed'), 0) as total_revenue,
        (SELECT COUNT(*) FROM branch_inventory bi WHERE bi.branch_id = b.id AND bi.current_stock <= bi.min_threshold) as low_stock_count
      FROM branches b
      WHERE b.is_active = 1
      ORDER BY b.id ASC
    `);

    return res.json({
      success: true,
      data: branches
    });
  } catch (err) {
    console.error('Error fetching branches:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch branches.' });
  }
}

async function getBranchById(req, res) {
  try {
    const { id } = req.params;
    const branch = await db.get(`SELECT * FROM branches WHERE id = $1`, [id]);

    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found.' });
    }

    return res.json({
      success: true,
      data: branch
    });
  } catch (err) {
    console.error('Error fetching branch:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch branch details.' });
  }
}

module.exports = {
  getAllBranches,
  getBranchById
};
