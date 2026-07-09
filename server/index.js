
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
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

// HTTP server'ı Express'ten ayrı oluşturuyoruz ki socket.io ona bağlanabilsin
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // geliştirme aşamasında hepsine izin, prod'da frontend URL'i ile sınırlarız
  },
});

io.on('connection', (socket) => {
  console.log('Yeni socket bağlantısı:', socket.id);

  socket.on('disconnect', () => {
    console.log('Socket bağlantısı koptu:', socket.id);
  });
});

// io nesnesini diğer dosyalardan erişilebilir yapıyoruz (agentRunner içinde kullanacağız)
app.set('io', io);

const { startScheduler } = require('./src/services/scheduler');
startScheduler(io);

server.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});