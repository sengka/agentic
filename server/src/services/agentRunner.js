const { scrapeSource } = require('./scraperService');
const { getEmbedding } = require('./embeddingService');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Report = require('../models/Report');
const Agent = require('../models/Agent');
const User = require('../models/User');
const { sendReportEmail } = require('./emailService');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Geçmiş feedback'lere göre her kaynağın puanını hesapla
const getSourceScores = async (agentId) => {
  const pastReports = await Report.find({ agent: agentId, feedback: { $ne: null } });
  const scores = {};

  pastReports.forEach((report) => {
    const point = report.feedback === 'like' ? 1 : report.feedback === 'dislike' ? -1 : 0;
    const sourcesInReport = new Set(report.items.map((item) => item.source));
    sourcesInReport.forEach((source) => {
      scores[source] = (scores[source] || 0) + point;
    });
  });

  return scores;
};

const runAgent = async (agentId, io) => {
  try {
    const agent = await Agent.findById(agentId);
    if (!agent || !agent.isActive) return;

    console.log(`Agent çalışıyor: ${agent.name}`);
    if (io) io.emit('agentStatus', { agentId, status: 'scraping', message: 'Kaynaklar taranıyor...' });

    const results = await Promise.all(
      agent.sources.map(async (source) => {
        const items = await scrapeSource(source);
        items.forEach(item => item.source = source);
        return items;
      })
    );
    const allItems = results.flat();

    if (allItems.length === 0) {
      console.log('Hiç içerik bulunamadı');
      if (io) io.emit('agentStatus', { agentId, status: 'failed', message: 'Hiç içerik bulunamadı' });
      return;
    }

    if (io) io.emit('agentStatus', { agentId, status: 'embedding', message: 'Embedding oluşturuluyor...' });

    // Geçmiş feedback'e göre kaynak puanlarını al
    const sourceScores = await getSourceScores(agentId);
    console.log('Kaynak puanları:', sourceScores);

    // Kaynaklara göre grupla
    const itemsBySource = {};
    allItems.forEach(item => {
      if (!itemsBySource[item.source]) itemsBySource[item.source] = [];
      itemsBySource[item.source].push(item);
    });

    // Puanlı ağırlıklı sıra listesi oluştur: yüksek puanlı kaynak, sırada daha sık geçsin
    const sourceKeys = Object.keys(itemsBySource);
    const weightedOrder = [];
    sourceKeys.forEach((source) => {
      const score = sourceScores[source] || 0;
      // Puan -1'den düşükse bile en az 1 kez dahil et (çeşitlilik için), yüksek puan daha sık tekrar etsin
      const weight = Math.max(1, score + 2);
      for (let i = 0; i < weight; i++) weightedOrder.push(source);
    });

    const balancedItems = [];
    let index = 0;
    const maxAttempts = weightedOrder.length * 5;
    let attempts = 0;
    while (balancedItems.length < 5 && attempts < maxAttempts) {
      const key = weightedOrder[index % weightedOrder.length];
      if (itemsBySource[key] && itemsBySource[key].length > 0) {
        balancedItems.push(itemsBySource[key].shift());
      }
      index++;
      attempts++;
      if (Object.values(itemsBySource).every(arr => arr.length === 0)) break;
    }

    const itemsWithEmbeddings = await Promise.all(
      balancedItems.map(async (item) => {
        try {
          const embedding = await getEmbedding(item.title + ' ' + item.summary);
          return { ...item, embedding };
        } catch {
          return { ...item, embedding: [] };
        }
      })
    );

    if (io) io.emit('agentStatus', { agentId, status: 'summarizing', message: 'Özet oluşturuluyor...' });

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const titlesText = itemsWithEmbeddings.map(i => `- ${i.title}`).join('\n');
    const prompt = `Aşağıdaki içerikleri Türkçe olarak 3-4 cümleyle özetle:\n${titlesText}`;

    let dailySummary;
    try {
      const result = await model.generateContent(prompt);
      dailySummary = result.response.text();
    } catch (error) {
      console.error('Gemini özet hatası:', error.message);
      dailySummary = 'Özet oluşturulamadı (Gemini API hatası).';
    }

    const report = new Report({
      agent: agent._id,
      user: agent.user,
      items: itemsWithEmbeddings,
      dailySummary
    });

    await report.save();
    console.log(`Rapor oluşturuldu: ${agent.name}`);
    if (io) io.emit('agentStatus', { agentId, status: 'done', message: 'Rapor hazır', reportId: report._id });

    const user = await User.findById(agent.user);
    if (user?.email) {
      await sendReportEmail(user.email, agent.name, dailySummary);
    }

    return report;

  } catch (error) {
    console.error('Agent çalışma hatası:', error.message);
    if (io) io.emit('agentStatus', { agentId, status: 'error', message: error.message });
  }
};

module.exports = { runAgent };