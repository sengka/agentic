const express = require('express');
const router = express.Router();
const { createAgent, getAgents, addSource, removeSource, testSource, deleteAgent, toggleActive, updateAgent } = require('../controllers/agentController');
const { protect } = require('../middleware/authMiddleware');


router.post('/', protect, createAgent);
router.post('/test-source', protect, testSource);
router.get('/', protect, getAgents);
router.post('/:id/sources', protect, addSource);
router.delete('/:id/sources', protect, removeSource);
router.delete('/:id', protect, deleteAgent);
router.patch('/:id/toggle', protect, toggleActive);
router.patch('/:id', protect, updateAgent);

const { runAgent } = require('../services/agentRunner');

router.post('/:id/run', protect, async (req, res) => {
  try {
    const io = req.app.get('io');
    const report = await runAgent(req.params.id, io);
    res.json({ message: 'Agent çalıştırıldı', report });
  } catch (error) {
    res.status(500).json({ message: 'Hata', error: error.message });
  }
});

module.exports = router;