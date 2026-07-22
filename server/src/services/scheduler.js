const cron = require('node-cron');
const { runAgent } = require('./agentRunner');
const Agent = require('../models/Agent');
const Report = require('../models/Report');

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const catchUpMissedRuns = async (io) => {
  try {
    const agents = await Agent.find({ isActive: true });
    for (const agent of agents) {
      const lastReport = await Report.findOne({ agent: agent._id }).sort({ createdAt: -1 });
      const shouldRun = !lastReport || (Date.now() - new Date(lastReport.createdAt).getTime()) > ONE_DAY_MS;

      if (shouldRun) {
        console.log(`Kaçırılan çalıştırma yakalanıyor: ${agent.name}`);
        await runAgent(agent._id, io);
      }
    }
  } catch (error) {
    console.error('Kaçırılan çalıştırmaları kontrol ederken hata:', error.message);
  }
};

const startScheduler = (io) => {
  if (process.env.ENABLE_CATCHUP !== 'false') {
    catchUpMissedRuns(io);
  } else {
    console.log('Kaçırılan çalıştırma kontrolü devre dışı (geliştirme modu)');
  }

  cron.schedule('0 * * * *', async () => {
    const currentHour = new Date().getHours();
    console.log(`Saatlik kontrol: ${currentHour}:00`);

    const agents = await Agent.find({ isActive: true, scheduledHour: currentHour });
    for (const agent of agents) {
      console.log(`Zamanlanmış çalıştırma: ${agent.name}`);
      await runAgent(agent._id, io);
    }
  });
};

module.exports = { startScheduler };