const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/demo-login', authController.demoLogin);
router.get('/me', authenticateToken, authController.getMe);
router.get('/users', authenticateToken, authController.getUsers);

module.exports = router;
