import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db/database.js";

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT id, name, email, password, role, branch_id FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        role: user.role,
        branch_id: user.branch_id
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch_id: user.branch_id
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
}
