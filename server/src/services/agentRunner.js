const { scrapeSource } = require('./scraperService');
const { getEmbedding } = require('./embeddingService');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Report = require('../models/Report');
const Agent = require('../models/Agent');
const User = require('../models/User');
const { sendReportEmail } = require('./emailService');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const runAgent = async (agentId, io) => {
  try {
    const agent = await Agent.findById(agentId);
    if (!agent || !agent.isActive) return;

    console.log(`Agent çalışıyor: ${agent.name}`);
    if (io) io.emit('agentStatus', { agentId, status: 'scraping', message: 'Kaynaklar taranıyor...' });

    const allItems = [];

    for (const source of agent.sources) {
      const items = await scrapeSource(source);
      items.forEach(item => item.source = source);
      allItems.push(...items);
    }

    if (allItems.length === 0) {
      console.log('Hiç içerik bulunamadı');
      if (io) io.emit('agentStatus', { agentId, status: 'failed', message: 'Hiç içerik bulunamadı' });
      return;
    }

    if (io) io.emit('agentStatus', { agentId, status: 'embedding', message: 'Embedding oluşturuluyor...' });

    const itemsWithEmbeddings = await Promise.all(
      allItems.slice(0, 5).map(async (item) => {
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