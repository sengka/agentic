const express = require('express');
const router = express.Router();
const { getReports, getReportsByAgent, updateFeedback, searchReports } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getReports);
router.get('/agent/:agentId', protect, getReportsByAgent);
router.patch('/:id/feedback', protect, updateFeedback);
router.post('/search', protect, searchReports);

module.exports = router;
