const Agent = require('../models/Agent');
const { parseAgentFromText } = require('../services/geminiService');
const { scrapeSource } = require('../services/scraperService');

const createAgent = async (req, res) => {
  try {
    const { userInput } = req.body;

    const config = await parseAgentFromText(userInput);

    const agent = new Agent({
      user: req.user.id,
      name: config.name,
      description: config.description,
      topics: config.topics,
      schedule: config.schedule,
      language: config.language
    });

    await agent.save();

    res.status(201).json({
      message: 'Agent oluşturuldu',
      agent
    });

  } catch (error) {
    res.status(500).json({ message: 'Agent oluşturulamadı', error: error.message });
  }
};

const getAgents = async (req, res) => {
  try {
    const agents = await Agent.find({ user: req.user.id });
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

const addSource = async (req, res) => {
  try {
    const { source } = req.body;
    const agent = await Agent.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent bulunamadı' });
    }

    if (!agent.sources.includes(source)) {
      agent.sources.push(source);
      await agent.save();
    }

    res.json({ message: 'Kaynak eklendi', agent });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

const removeSource = async (req, res) => {
  try {
    const { source } = req.body;
    const agent = await Agent.findOne({ _id: req.params.id, user: req.user.id });

    if (!agent) {
      return res.status(404).json({ message: 'Agent bulunamadı' });
    }

    agent.sources = agent.sources.filter(s => s !== source);
    await agent.save();

    res.json({ message: 'Kaynak silindi', agent });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

const testSource = async (req, res) => {
  try {
    const { source } = req.body;
    if (!source) {
      return res.status(400).json({ message: 'Kaynak URL gerekli' });
    }

    const items = await scrapeSource(source);

if (items.length === 0) {
  return res.json({
    success: false,
    message: 'Bu kaynaktan güvenilir şekilde veri çekilemedi. Farklı bir haber kaynağı deneyebilir misin?',
  });
}

    res.json({
      success: true,
      message: `${items.length} içerik bulundu`,
      sample: items.slice(0, 3).map(i => i.title),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Test sırasında hata oluştu', error: error.message });
  }
};

const deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!agent) {
      return res.status(404).json({ message: 'Agent bulunamadı' });
    }

    res.json({ message: 'Agent silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

const toggleActive = async (req, res) => {
  try {
    const agent = await Agent.findOne({ _id: req.params.id, user: req.user.id });
    if (!agent) {
      return res.status(404).json({ message: 'Agent bulunamadı' });
    }
    agent.isActive = !agent.isActive;
    await agent.save();
    res.json({ message: 'Durum güncellendi', agent });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};
const updateAgent = async (req, res) => {
  try {
    const { name, description, topics, scheduledHour } = req.body;
    const agent = await Agent.findOne({ _id: req.params.id, user: req.user.id });

    if (!agent) {
      return res.status(404).json({ message: 'Agent bulunamadı' });
    }

    if (name !== undefined) agent.name = name;
    if (description !== undefined) agent.description = description;
    if (topics !== undefined) agent.topics = topics;
    if (scheduledHour !== undefined) agent.scheduledHour = scheduledHour;

    await agent.save();
    res.json({ message: 'Agent güncellendi', agent });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

module.exports = { createAgent, getAgents, addSource, removeSource, testSource, deleteAgent, toggleActive, updateAgent };