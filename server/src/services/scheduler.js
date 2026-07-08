const cron = require('node-cron');
const { runAgent } = require('./agentRunner');
const Agent = require('../models/Agent');

const startScheduler = () => {
 cron.schedule('0 7 * * *', async () => {// TEST: her 1 dakikada bir
    console.log('Günlük agent çalışması başlıyor...');
    const agents = await Agent.find({ isActive: true });
    for (const agent of agents) {
      await runAgent(agent._id);
    }
  });
};

module.exports = { startScheduler };