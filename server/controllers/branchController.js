import { pool } from "../db/database.js";

export async function getBranches(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM branches ORDER BY id"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function createBranch(req, res) {
  try {
    const { name, location, phone } = req.body;

    const result = await pool.query(
      "INSERT INTO branches (name, location, phone) VALUES ($1, $2, $3) RETURNING *",
      [name, location, phone]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
