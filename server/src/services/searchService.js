const { getEmbedding } = require('./embeddingService');
const Report = require('../models/Report');

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

module.exports = { semanticSearch };