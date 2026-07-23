# Agentic 🤖

**Kişisel AI Ekosistem Platformu** — Kullanıcılar doğal dille kendi AI agent'larını tanımlar; agent'lar arka planda otomatik olarak veri toplar, RAG tabanlı analiz yapar ve kişiselleştirilmiş özetler sunar.

Bir RSS/haber sitesi takip edici olarak başlayan proje, zamanla kendini geliştiren, sohbet edilebilen ve otonom çalışan tam bir AI ekosistemine dönüştü.

---

## ✨ Özellikler

### Agent Yönetimi

- **Doğal dille agent oluşturma** — Gemini API ile kullanıcının yazdığı serbest metinden agent adı, açıklaması ve konuları otomatik çıkarılır
- **Agent düzenleme** — isim, açıklama, konular ve çalışma saati sonradan güncellenebilir
- **Aktif/Pasif kontrolü** — tek tıkla bir agent'ı duraklat/etkinleştir
- **Özelleştirilebilir zamanlama** — her agent kendi tercih edilen saatte otomatik çalışır
- **Kaçırılan çalıştırmayı yakalama** — sunucu her açıldığında, 24 saatten uzun süredir çalışmamış agent'lar otomatik tetiklenir

### Akıllı Veri Toplama

- **RSS otomatik keşif** — kullanıcı düz bir web adresi girer, sistem arka planda (standart `<link>` etiketi veya site footer'ındaki RSS dizin sayfaları üzerinden) uygun RSS feed'ini otomatik bulur — kullanıcının RSS bilgisine ihtiyacı yoktur
- **Paralel kaynak taraması** — birden fazla kaynak aynı anda taranır
- **Kaynak dengeleme (round-robin)** — tek bir kaynağın raporu domine etmesi önlenir
- **Kaynak test/önizleme** — kaynak eklemeden önce anında test edilebilir
- **Agent kendini geliştirme** — kullanıcı geri bildirimlerine (beğen/beğenme) göre kaynaklar zamanla ağırlıklı olarak önceliklendirilir

### RAG ve Yapay Zeka

- **Embedding tabanlı semantik arama** — geçmiş raporlar arasında doğal dille anlam bazlı arama
- **AI destekli soru-cevap** — bulunan içerikler Gemini'ye context olarak verilip, kullanıcının sorusuna sadece gerçek verilere dayanan, uydurma içermeyen bir cevap üretilir
- **Kalıcı sohbet widget'ı** — uygulamanın her sayfasında erişilebilen, sayfa geçişlerinde hafızasını koruyan sohbet paneli
- **Haftalık meta-özet** — bir haftalık tüm raporları tek bir üst-düzey sentez haline getiren otomatik özet

### Gerçek Zamanlı Deneyim

- **Socket.io ile canlı takip** — bir agent çalışırken (tarama, embedding, özetleme aşamaları) durum anlık olarak arayüzde gösterilir
- **Email bildirimleri** — günlük özet otomatik olarak kullanıcının email adresine gönderilir

### Dashboard ve Analitik

- **Aktivite takvimi** — GitHub tarzı ısı haritası, geçmiş kullanım yoğunluğunu görselleştirir; bir güne tıklayınca o günün raporları listelenir
- **Genel istatistikler** — toplam rapor sayısı, aktif agent oranı, en aktif agent
- **Agent'a özel rapor geçmişi** — her agent'ın kendi rapor arşivi ayrı görüntülenebilir

---

## 🛠️ Tech Stack

**Frontend:** React (Vite), TailwindCSS, Socket.io-client, Axios, React Router

**Backend:** Node.js, Express.js, Socket.io, node-cron

**Veritabanı:** MongoDB (Mongoose) — embedding vektörleri de MongoDB içinde native olarak saklanır ve cosine similarity ile aranır

**AI:** Google Gemini API

- `gemini-2.5-flash` — doğal dil işleme, özetleme, soru-cevap
- `gemini-embedding-001` — semantik arama için embedding üretimi

**Scraping:** RSS Parser, Cheerio, axios

**Auth:** JWT, bcrypt

**Email:** Nodemailer (SMTP)

---

## 📁 Proje Yapısı

```
agentic/
├── client/                 # React frontend
│   └── src/
│       ├── pages/          # Dashboard, Reports, Search, CreateAgent, vb.
│       ├── components/     # ChatWidget, ActivityHeatmap
│       └── ThemeContext.jsx
└── server/                 # Node.js backend
    └── src/
        ├── controllers/    # auth, agent, report controller'ları
        ├── models/         # User, Agent, Report şemaları
        ├── routes/
        ├── services/       # scraper, embedding, agentRunner, scheduler,
        │                    # searchService, weeklySummaryService, emailService
        └── middleware/
```

---

## 🚀 Kurulum

### Gereksinimler

- Node.js
- MongoDB (yerel veya Atlas)
- Gemini API anahtarı
- Gmail App Password (email bildirimleri için)

### Backend

```bash
cd server
npm install
```

`.env` dosyası oluştur:

```
MONGO_URI=mongodb://localhost:27017/agentic
JWT_SECRET=<gizli-anahtar>
GEMINI_API_KEY=<gemini-api-anahtarın>
EMAIL_USER=<gmail-adresin>
EMAIL_PASS=<gmail-uygulama-şifresi>
PORT=5000
ENABLE_CATCHUP=true
```

```bash
node index.js
```

### Frontend

```bash
cd client
npm install
npm run dev
```

---

## 👩‍💻 Geliştirici

**Sena Gül Kara** — Samsun Üniversitesi, Yazılım Mühendisliği
Kodpit bünyesinde staj kapsamında geliştirilmiştir.
