const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const parseAgentFromText = async (userInput) => {
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
Kullanıcı aşağıdaki metni yazarak bir AI agent tanımlamak istiyor:
"${userInput}"

Bu metni analiz ederek aşağıdaki JSON formatında bir agent konfigürasyonu oluştur:
{
  "name": "agent'ın kısa adı",
  "description": "agent'ın ne yaptığının açıklaması",
  "topics": ["konu1", "konu2"],
  "schedule": "daily",
  "language": "tr"
}

Sadece JSON döndür, başka hiçbir şey yazma.
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

const enhancePromptText = async (userInput) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
Kullanıcı bir AI agent oluşturmak istiyor ve başlangıç olarak şu açıklamayı yazdı:
"${userInput}"

Bu açıklamayı analiz et ve onu daha kapsamlı, profesyonel, detaylı ve ne yapacağını (hangi konuları tarayacağını, nasıl özetleyeceğini) açıkça belirten zengin bir AI agent oluşturma promptuna (tanımına) dönüştür. Türkçe yaz. Sadece geliştirilmiş prompt metnini döndür, başka hiçbir açıklama veya yorum ekleme.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};

module.exports = { parseAgentFromText, enhancePromptText };