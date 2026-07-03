const Agent = require('../models/Agent');
const { parseAgentFromText } = require('../services/geminiService');

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

module.exports = { createAgent, getAgents, addSource, removeSource };