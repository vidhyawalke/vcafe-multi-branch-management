const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, branchController.getAllBranches);
router.get('/:id', authenticateToken, branchController.getBranchById);

module.exports = router;
