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

module.exports = { createAgent, getAgents };