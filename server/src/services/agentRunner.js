const { scrapeSource } = require('./scraperService');
const { getEmbedding } = require('./embeddingService');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Report = require('../models/Report');
const Agent = require('../models/Agent');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const runAgent = async (agentId) => {
  try {
    const agent = await Agent.findById(agentId);
    if (!agent || !agent.isActive) return;

    console.log(`Agent çalışıyor: ${agent.name}`);

    const allItems = [];

    for (const source of agent.sources) {
      const items = await scrapeSource(source);
      items.forEach(item => item.source = source);
      allItems.push(...items);
    }

    if (allItems.length === 0) {
      console.log('Hiç içerik bulunamadı');
      return;
    }

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

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const titlesText = itemsWithEmbeddings.map(i => `- ${i.title}`).join('\n');
    const prompt = `Aşağıdaki içerikleri Türkçe olarak 3-4 cümleyle özetle:\n${titlesText}`;
    const result = await model.generateContent(prompt);
    const dailySummary = result.response.text();

    const report = new Report({
      agent: agent._id,
      user: agent.user,
      items: itemsWithEmbeddings,
      dailySummary
    });

    await report.save();
    console.log(`Rapor oluşturuldu: ${agent.name}`);
    return report;

  } catch (error) {
    console.error('Agent çalışma hatası:', error.message);
  }
};

module.exports = { runAgent };