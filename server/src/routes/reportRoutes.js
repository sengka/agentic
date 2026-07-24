const express = require('express');
const router = express.Router();
const { getReports, getReportsByAgent, updateFeedback, searchReports, getWeeklySummary, exportReportPDF  } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getReports);
router.get('/agent/:agentId', protect, getReportsByAgent);
router.patch('/:id/feedback', protect, updateFeedback);
router.get('/weekly-summary', protect, getWeeklySummary);
router.post('/search', protect, searchReports);
router.get('/:id/pdf', protect, exportReportPDF);
module.exports = router;
