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

module.exports = { parseAgentFromText };