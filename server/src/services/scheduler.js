const cron = require('node-cron');
const { runAgent } = require('./agentRunner');
const Agent = require('../models/Agent');
const Report = require('../models/Report');
const User = require('../models/User');
const { generateWeeklySummary } = require('./weeklySummaryService');
const { sendWeeklySummaryEmail } = require('./emailService');

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
  // Her Pazartesi sabah 08:00'de, agent'ı olan her kullanıcıya haftalık özet gönder
  cron.schedule('0 8 * * 1', async () => {
    console.log('Haftalık özet email gönderimi başlıyor...');
    try {
      const usersWithAgents = await Agent.distinct('user');
      for (const userId of usersWithAgents) {
        const user = await User.findById(userId);
        if (!user?.email) continue;

        const { summary, reportCount } = await generateWeeklySummary(userId);
        if (reportCount > 0) {
          await sendWeeklySummaryEmail(user.email, summary, reportCount);
        }
      }
    } catch (error) {
      console.error('Haftalık özet gönderim hatası:', error.message);
    }
  });
};

module.exports = { startScheduler };