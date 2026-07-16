const { getEmbedding } = require('./embeddingService');
const Report = require('../models/Report');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// İki vektör arasındaki cosine similarity'yi hesaplar (0-1 arası, 1 = tam eşleşme)
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA?.length || !vecB?.length || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const semanticSearch = async (userId, query, limit = 5) => {
  const queryEmbedding = await getEmbedding(query);

  const reports = await Report.find({ user: userId }).populate('agent', 'name');

  const scoredItems = [];

  reports.forEach((report) => {
    report.items.forEach((item) => {
      if (item.embedding?.length > 0) {
        const score = cosineSimilarity(queryEmbedding, item.embedding);
        scoredItems.push({
          score,
          title: item.title,
          summary: item.summary,
          link: item.link,
          source: item.source,
          publishedAt: item.publishedAt,
          agentName: report.agent?.name || 'Bilinmeyen Agent',
          reportDate: report.createdAt,
        });
      }
    });
  });

  scoredItems.sort((a, b) => b.score - a.score);

  return scoredItems.slice(0, limit);
};
const generateAnswer = async (query, items) => {
  if (items.length === 0) {
    return 'Bu konuda geçmiş raporlarında herhangi bir bilgi bulunamadı.';
  }

  const context = items
    .map((item, i) => `${i + 1}. ${item.title}\n${item.summary || ''}`)
    .join('\n\n');

  const prompt = `Aşağıda kullanıcının geçmiş haber raporlarından bulunan en alakalı içerikler var. Bu içeriklere dayanarak kullanıcının sorusunu Türkçe, doğal ve akıcı bir dille cevapla. Sadece verilen içeriklerdeki bilgileri kullan, uydurma bilgi ekleme.

Kullanıcının sorusu: "${query}"

İlgili içerikler:
${context}

Cevap:`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Cevap üretme hatası:', error.message);
    return 'Cevap üretilirken bir hata oluştu, ancak ilgili haberleri aşağıda bulabilirsin.';
  }
};

module.exports = { semanticSearch, generateAnswer };
