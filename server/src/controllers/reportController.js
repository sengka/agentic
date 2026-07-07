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

module.exports = { getReports, getReportsByAgent };