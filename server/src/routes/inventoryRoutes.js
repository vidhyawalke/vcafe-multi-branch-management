const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', authenticateToken, inventoryController.getInventory);
router.post('/adjust', authenticateToken, requireRole('owner', 'manager'), inventoryController.adjustStock);
router.post('/transfer', authenticateToken, requireRole('owner', 'manager'), inventoryController.transferStock);
router.get('/logs', authenticateToken, inventoryController.getInventoryLogs);

module.exports = router;
