import { pool } from "../db/database.js";

export async function getOrders(req, res) {
  try {
    const branchId = req.user.role === "ADMIN"
      ? (req.query.branch_id || null)
      : req.user.branch_id;

    const query = branchId
      ? `SELECT o.*, b.name AS branch_name
         FROM orders o JOIN branches b ON b.id = o.branch_id
         WHERE o.branch_id = $1
         ORDER BY o.created_at DESC`
      : `SELECT o.*, b.name AS branch_name
         FROM orders o JOIN branches b ON b.id = o.branch_id
         ORDER BY o.created_at DESC`;

    const result = branchId
      ? await pool.query(query, [branchId])
      : await pool.query(query);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function createOrder(req, res) {
  const client = await pool.connect();

  try {
    const { customer_name, branch_id, items } = req.body;

    await client.query("BEGIN");

    const orderResult = await client.query(
      `INSERT INTO orders (branch_id, user_id, customer_name, total_amount)
       VALUES ($1, $2, $3, 0)
       RETURNING id`,
      [branch_id, req.user.id, customer_name]
    );

    const orderId = orderResult.rows[0].id;
    let total = 0;

    for (const item of items) {
      const menuResult = await client.query(
        "SELECT price FROM menu_items WHERE id = $1 AND branch_id = $2",
        [item.menu_item_id, branch_id]
      );

      if (!menuResult.rows[0]) {
        throw new Error("Menu item does not belong to this branch");
      }

      const price = Number(menuResult.rows[0].price);
      total += price * item.quantity;

      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.menu_item_id, item.quantity, price]
      );
    }

    await client.query(
      "UPDATE orders SET total_amount = $1 WHERE id = $2",
      [total, orderId]
    );

    await client.query("COMMIT");

    res.status(201).json({ id: orderId, total });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE orders
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
