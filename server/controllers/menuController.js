import { pool } from "../db/database.js";

export async function getMenu(req, res) {
  try {
    const branchId = req.query.branch_id || req.user.branch_id;

    const result = await pool.query(
      `SELECT id, name, category, price, available, branch_id
       FROM menu_items
       WHERE branch_id = $1
       ORDER BY category, name`,
      [branchId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function createMenuItem(req, res) {
  try {
    const { name, category, price, branch_id } = req.body;

    const result = await pool.query(
      `INSERT INTO menu_items (name, category, price, branch_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, category, price, branch_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
