const express = require('express');
const router = express.Router();
const { createAgent, getAgents } = require('../controllers/agentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createAgent);
router.get('/', protect, getAgents);

module.exports = router;