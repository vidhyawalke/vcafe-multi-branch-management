const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/categories', menuController.getCategories);
router.get('/items', menuController.getMenuItems);
router.patch('/items/:id/availability', authenticateToken, requireRole('owner', 'manager'), menuController.toggleAvailability);

module.exports = router;
