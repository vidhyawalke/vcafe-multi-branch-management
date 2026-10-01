const db = require('../config/db');

async function getDashboardMetrics(req, res) {
  try {
    const { branchId, timeRange = 'all' } = req.query;

    let targetBranchId = branchId;
    if (req.user.role !== 'owner' && !targetBranchId) {
      targetBranchId = req.user.branchId;
    }

    // 1. Base query filter
    let whereClause = " WHERE o.status = 'completed'";
    const params = [];

    if (targetBranchId) {
      whereClause += ' AND o.branch_id = $' + (params.length + 1);
      params.push(targetBranchId);
    }

    // 2. High-level KPIs
    const kpiSummary = await db.get(
      `SELECT
         COUNT(o.id) as total_orders,
         COALESCE(SUM(o.total_amount), 0) as total_revenue,
         COALESCE(AVG(o.total_amount), 0) as average_order_value,
         COALESCE(SUM(o.tax_amount), 0) as total_tax_collected
       FROM orders o
       ${whereClause}`,
      params
    );

    // 3. Low stock count for selected scope
    let lowStockQuery = `
      SELECT COUNT(*) as count
      FROM branch_inventory bi
      WHERE bi.current_stock <= bi.min_threshold
    `;
    const lowStockParams = [];
    if (targetBranchId) {
      lowStockQuery += ' AND bi.branch_id = $1';
      lowStockParams.push(targetBranchId);
    }
    const lowStockRes = await db.get(lowStockQuery, lowStockParams);

    // 4. Branch comparison breakdown
    const branchBreakdown = await db.all(`
      SELECT b.id, b.name, b.code,
             COUNT(o.id) as branch_orders,
             COALESCE(SUM(o.total_amount), 0) as branch_revenue
      FROM branches b
      LEFT JOIN orders o ON b.id = o.branch_id AND o.status = 'completed'
      GROUP BY b.id, b.name, b.code
      ORDER BY branch_revenue DESC
    `);

    // 5. Top 5 Best Selling Items
    let topItemsQuery = `
      SELECT oi.item_name,
             SUM(oi.quantity) as units_sold,
             SUM(oi.subtotal) as total_sales
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      ${whereClause}
      GROUP BY oi.item_name
      ORDER BY units_sold DESC
      LIMIT 5
    `;
    const topItems = await db.all(topItemsQuery, params);

    // 6. Payment method breakdown
    let paymentQuery = `
      SELECT o.payment_method,
             COUNT(o.id) as count,
             SUM(o.total_amount) as amount
      FROM orders o
      ${whereClause}
      GROUP BY o.payment_method
    `;
    const paymentBreakdown = await db.all(paymentQuery, params);

    // 7. Order Type breakdown (Dine In vs Takeaway)
    let typeQuery = `
      SELECT o.order_type,
             COUNT(o.id) as count,
             SUM(o.total_amount) as amount
      FROM orders o
      ${whereClause}
      GROUP BY o.order_type
    `;
    const typeBreakdown = await db.all(typeQuery, params);

    // 8. Recent 7 Days Revenue Trend
    // Generate clean trend records
    const recentOrders = await db.all(
      `SELECT DATE(o.created_at) as order_date,
              COUNT(o.id) as order_count,
              SUM(o.total_amount) as daily_revenue
       FROM orders o
       ${whereClause}
       GROUP BY DATE(o.created_at)
       ORDER BY order_date DESC
       LIMIT 7`,
      params
    );

    return res.json({
      success: true,
      data: {
        kpis: {
          totalOrders: Number(kpiSummary.total_orders) || 0,
          totalRevenue: Number(Number(kpiSummary.total_revenue).toFixed(2)) || 0,
          averageOrderValue: Number(Number(kpiSummary.average_order_value).toFixed(2)) || 0,
          totalTaxCollected: Number(Number(kpiSummary.total_tax_collected).toFixed(2)) || 0,
          lowStockAlerts: Number(lowStockRes.count) || 0
        },
        branchBreakdown,
        topItems,
        paymentBreakdown,
        typeBreakdown,
        recentTrend: recentOrders.reverse()
      }
    });
  } catch (err) {
    console.error('Error fetching dashboard metrics:', err);
    return res.status(500).json({ success: false, message: 'Failed to compute dashboard metrics.' });
  }
}

module.exports = {
  getDashboardMetrics
};
