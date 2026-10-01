const db = require('../config/db');

async function getCategories(req, res) {
  try {
    const categories = await db.all(`SELECT * FROM categories ORDER BY display_order ASC`);
    return res.json({ success: true, data: categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
}

async function getMenuItems(req, res) {
  try {
    const { categoryId, availableOnly } = req.query;
    let sql = `
      SELECT m.*, c.name as category_name, c.slug as category_slug
      FROM menu_items m
      JOIN categories c ON m.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (categoryId) {
      sql += ' AND m.category_id = $' + (params.length + 1);
      params.push(categoryId);
    }

    if (availableOnly === 'true') {
      sql += ' AND m.is_available = 1';
    }

    sql += ' ORDER BY c.display_order ASC, m.price ASC';

    const items = await db.all(sql, params);
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('Error fetching menu items:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch menu items.' });
  }
}

async function toggleAvailability(req, res) {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    await db.query(
      `UPDATE menu_items SET is_available = $1 WHERE id = $2`,
      [isAvailable ? 1 : 0, id]
    );

    return res.json({ success: true, message: 'Item availability updated.' });
  } catch (err) {
    console.error('Error updating availability:', err);
    return res.status(500).json({ success: false, message: 'Failed to update item availability.' });
  }
}

module.exports = {
  getCategories,
  getMenuItems,
  toggleAvailability
};
