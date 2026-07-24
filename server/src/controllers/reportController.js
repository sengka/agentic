const Report = require('../models/Report');
const { generateWeeklySummary } = require('../services/weeklySummaryService');
const PDFDocument = require('pdfkit');

const { semanticSearch, generateAnswer } = require('../services/searchService');

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

const searchReports = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'Arama sorgusu gerekli' });
    }

    const results = await semanticSearch(req.user.id, query);
    const answer = await generateAnswer(query, results);

    res.json({ answer, results });
  } catch (error) {
    res.status(500).json({ message: 'Arama sırasında hata oluştu', error: error.message });
  }
};
const getWeeklySummary = async (req, res) => {
  try {
    const result = await generateWeeklySummary(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Haftalık özet oluşturulurken hata oluştu', error: error.message });
  }
};

const exportReportPDF = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, user: req.user.id }).populate('agent', 'name');
    if (!report) {
      return res.status(404).json({ message: 'Rapor bulunamadı' });
    }

    const doc = new PDFDocument({ margin: 50 });
    doc.font('C:\\Windows\\Fonts\\arial.ttf');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="rapor-${report._id}.pdf"`);

    doc.pipe(res);

    doc.fontSize(20).fillColor('#4f46e5').text(report.agent?.name || 'Agent Raporu', { align: 'left' });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#666').text(new Date(report.createdAt).toLocaleDateString('tr-TR', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }));
    doc.moveDown(1);

    doc.fontSize(14).fillColor('#000').text('Günlük Özet', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor('#333').text((report.dailySummary || '').replace(/\*\*/g, '').replace(/\*/g, ''), {
      align: 'justify'
    });
    doc.moveDown(1.5);

    doc.fontSize(14).fillColor('#000').text('Haberler', { underline: true });
    doc.moveDown(0.5);

    report.items.forEach((item, i) => {
      doc.fontSize(11).fillColor('#4f46e5').text(`${i + 1}. ${item.title}`, { link: item.link });
      doc.fontSize(9).fillColor('#999').text(item.source);
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'PDF oluşturulurken hata oluştu', error: error.message });
  }
};

module.exports = { getReports, getReportsByAgent, updateFeedback, searchReports, getWeeklySummary, exportReportPDF };