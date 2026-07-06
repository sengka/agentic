const express = require('express');
const router = express.Router();
const { createAgent, getAgents, addSource, removeSource } = require('../controllers/agentController');
const { protect } = require('../middleware/authMiddleware');


router.post('/', protect, createAgent);
router.get('/', protect, getAgents);
router.post('/:id/sources', protect, addSource);
router.delete('/:id/sources', protect, removeSource);

const { runAgent } = require('../services/agentRunner');

router.post('/:id/run', protect, async (req, res) => {
  try {
    const report = await runAgent(req.params.id);
    res.json({ message: 'Agent çalıştırıldı', report });
  } catch (error) {
    res.status(500).json({ message: 'Hata', error: error.message });
  }
});

module.exports = router;