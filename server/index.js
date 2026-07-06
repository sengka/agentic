const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı ✅'))
  .catch((err) => console.log('MongoDB bağlantı hatası ❌', err));

const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);
const agentRoutes = require('./src/routes/agentRoutes');

app.use('/api/agents', agentRoutes);
app.get('/', (req, res) => {
  res.json({ message: 'Agentic API çalışıyor 🚀' });
});

const PORT = process.env.PORT || 5000;
const cron = require('node-cron');
const { runAgent } = require('./src/services/agentRunner');
const Agent = require('./src/models/Agent');

// Her sabah 07:00'de çalışır
cron.schedule('0 7 * * *', async () => {
  console.log('Günlük agent çalışması başlıyor...');
  const agents = await Agent.find({ isActive: true });
  for (const agent of agents) {
    await runAgent(agent._id);
  }
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});