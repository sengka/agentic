const express = require('express');
const router = express.Router();
const { createAgent, getAgents, addSource, removeSource } = require('../controllers/agentController');
const { protect } = require('../middleware/authMiddleware');


router.post('/', protect, createAgent);
router.get('/', protect, getAgents);
router.post('/:id/sources', protect, addSource);
router.delete('/:id/sources', protect, removeSource);

module.exports = router;