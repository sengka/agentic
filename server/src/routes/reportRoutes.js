const express = require('express');
const router = express.Router();
const { getReports, getReportsByAgent } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getReports);
router.get('/agent/:agentId', protect, getReportsByAgent);

module.exports = router;
