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

const reportRoutes = require('./src/routes/reportRoutes');
app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 5000;

const { startScheduler } = require('./src/services/scheduler');
startScheduler();

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});