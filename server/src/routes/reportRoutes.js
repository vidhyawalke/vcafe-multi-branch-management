const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/metrics', authenticateToken, requireRole('owner', 'manager'), reportController.getDashboardMetrics);

module.exports = router;
