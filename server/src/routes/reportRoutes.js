const express = require('express');
const router = express.Router();
const { getReports, getReportsByAgent, updateFeedback } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getReports);
router.get('/agent/:agentId', protect, getReportsByAgent);
router.patch('/:id/feedback', protect, updateFeedback);

module.exports = router;
