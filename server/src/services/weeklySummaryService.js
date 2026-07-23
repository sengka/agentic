const { GoogleGenerativeAI } = require('@google/generative-ai');
const Report = require('../models/Report');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateWeeklySummary = async (userId) => {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const reports = await Report.find({
    user: userId,
    createdAt: { $gte: weekAgo, $lte: now }
  }).populate('agent', 'name').sort({ createdAt: 1 });

  if (reports.length === 0) {
    return {
      summary: 'Bu hafta içinde henüz rapor oluşturulmamış.',
      reportCount: 0,
      weekStart: weekAgo,
      weekEnd: now,
    };
  }

  const combinedText = reports
    .map((r) => `[${r.agent?.name || 'Agent'} - ${new Date(r.createdAt).toLocaleDateString('tr-TR')}]\n${r.dailySummary}`)
    .join('\n\n');

  const prompt = `Aşağıda bir kullanıcının son bir hafta içinde farklı AI agent'larından aldığı günlük özetler var. Bunları analiz ederek haftanın öne çıkan ortak temalarını, tekrar eden konuları ve önemli gelişmeleri Türkçe olarak 4-6 cümlelik akıcı bir haftalık özet halinde sun. Tekil günlük özetleri sırayla tekrar etme, üst düzey bir sentez yap.

${combinedText}`;

  let summaryText;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    summaryText = result.response.text();
  } catch (error) {
    console.error('Haftalık özet hatası:', error.message);
    summaryText = 'Haftalık özet oluşturulamadı (Gemini API hatası).';
  }

  return {
    summary: summaryText,
    reportCount: reports.length,
    weekStart: weekAgo,
    weekEnd: now,
  };
};

module.exports = { generateWeeklySummary };