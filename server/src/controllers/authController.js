const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

function generateToken(user, branchName) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branchId: user.branch_id,
      branchName: branchName || null
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// User login with email and password
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await db.get(
      `SELECT u.*, b.name as branch_name, b.code as branch_code
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE LOWER(u.email) = LOWER($1) AND u.is_active = 1`,
      [email.trim()]
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or inactive account.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or inactive account.' });
    }

    const token = generateToken(user, user.branch_name);

    return res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          branchId: user.branch_id,
          branchName: user.branch_name,
          branchCode: user.branch_code
        }
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
}

// Demo quick-login for interview demos / reviewers
async function demoLogin(req, res) {
  try {
    const { persona } = req.body; // 'owner', 'manager_panjim', 'staff_anjuna'

    let targetEmail = 'owner@vcafe.com';
    if (persona === 'manager_panjim') targetEmail = 'manager.panjim@vcafe.com';
    if (persona === 'manager_anjuna') targetEmail = 'manager.anjuna@vcafe.com';
    if (persona === 'staff_panjim') targetEmail = 'staff.panjim@vcafe.com';
    if (persona === 'staff_anjuna') targetEmail = 'staff.anjuna@vcafe.com';

    const user = await db.get(
      `SELECT u.*, b.name as branch_name, b.code as branch_code
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE u.email = $1`,
      [targetEmail]
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'Demo persona account not found.' });
    }

    const token = generateToken(user, user.branch_name);

    return res.json({
      success: true,
      message: `Switched persona to ${user.name} (${user.role}).`,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          branchId: user.branch_id,
          branchName: user.branch_name,
          branchCode: user.branch_code
        }
      }
    });
  } catch (err) {
    console.error('Demo login error:', err);
    return res.status(500).json({ success: false, message: 'Failed to switch demo persona.' });
  }
}

// Get current authenticated user profile
async function getMe(req, res) {
  try {
    const user = await db.get(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.branch_id, u.created_at,
              b.name as branch_name, b.code as branch_code, b.address as branch_address
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
}

// Get all team members (owner can see all; manager sees branch staff)
async function getUsers(req, res) {
  try {
    let sql = `
      SELECT u.id, u.name, u.email, u.role, u.phone, u.is_active, u.created_at,
             b.name as branch_name, b.code as branch_code
      FROM users u
      LEFT JOIN branches b ON u.branch_id = b.id
    `;
    const params = [];

    if (req.user.role === 'manager') {
      sql += ' WHERE u.branch_id = $1';
      params.push(req.user.branchId);
    }

    sql += ' ORDER BY u.role ASC, u.name ASC';

    const users = await db.all(sql, params);
    return res.json({ success: true, data: users });
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
}

module.exports = {
  login,
  demoLogin,
  getMe,
  getUsers
};
