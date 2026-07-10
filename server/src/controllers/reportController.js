const Report = require('../models/Report');

const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id })
      .populate('agent', 'name')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

const getReportsByAgent = async (req, res) => {
  try {
    const reports = await Report.find({ 
      user: req.user.id, 
      agent: req.params.agentId 
    }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};
const updateFeedback = async (req, res) => {
  try {
    const { feedback } = req.body;

    if (!['like', 'dislike', null].includes(feedback)) {
      return res.status(400).json({ message: 'Geçersiz feedback değeri' });
    }

    const report = await Report.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { feedback },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: 'Rapor bulunamadı' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};
module.exports = { getReports, getReportsByAgent, updateFeedback };