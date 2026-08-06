# Agentic 🤖

**Kişisel AI Ekosistem Platformu** — Kullanıcıların doğal dille kendi yapay zeka ajanlarını (AI Agents) tanımladığı; arka planda otonom olarak veri toplayan, RAG (Retrieval-Augmented Generation) tabanlı analiz yapan, e-posta bildirimleri gönderen ve hem **Web** hem de **Mobil** platformlarda anlık senkronizasyon sunan tam teşekküllü bir yapay zeka ekosistemidir.

Bu proje; basit bir RSS takip edici olarak başlayıp, otonom çalışan, yapay zeka tabanlı soru-cevap asistanı barındıran ve canlı socket.io bildirimleri sunan çok platformlu (Web + Mobil) profesyonel bir SaaS ürününe dönüşmüştür.

---

## ✨ Özellikler

### 🤖 Ajan (Agent) Yönetimi
- **Doğal Dille Ajan Tanımlama:** Gemini API ile kullanıcının serbest metin olarak yazdığı hedeflerden (Örn: *"Döviz kurlarını takip et"*) ajan adı, açıklaması ve anahtar konular otomatik çıkarılır.
- **Sihirli "AI Geliştir" Sihirbazı (Web & Mobil):** Kullanıcı basit bir tanım yazdığında, tek tıkla prompt Gemini tarafından zenginleştirilerek profesyonel bir ajan komutuna dönüştürülür.
- **Canlı Çalışma Durumu Takibi:** Ajanlar arka planda çalışırken tarama, embedding, özetleme ve rapor oluşturma aşamaları Socket.io üzerinden hem web hem mobil ekranda canlı olarak izlenebilir.
- **Gelişmiş Ajan Yönetimi:** Ajanları tek tıkla aktif/pasif yapma, anlık çalıştırma (▶ Run), düzenleme (isim, açıklama, saat, konular) ve silme işlemleri her iki platformdan da yapılabilir.

### 🌐 Akıllı Veri Toplama & RSS Keşfi
- **RSS Otomatik Keşif:** Kullanıcı düz bir web adresi girdiğinde, sistem arka planda sitenin `<link>` etiketlerini veya footer sayfalarını tarayarak uygun RSS feed'ini otomatik bulur.
- **Dengeli Tarama:** Paralel kaynak taraması ve round-robin (dengeli) kaynak seçimiyle tek bir kaynağın raporu domine etmesi önlenir.
- **Geri Bildirim Döngüsü:** Kullanıcı raporları beğendikçe (👍/👎), o rapora kaynaklık eden sitelerin ağırlığı otomatik olarak artırılır/azaltılır.

### 🧠 RAG ve Akıllı Soru-Cevap (AI Search & Chat)
- **Vektör Tabanlı Semantik Arama:** Geçmiş raporlar içinde doğal dille anlam bazlı arama yapma yeteneği.
- **Agentic AI Asistanı:** Yapay zeka, arama sonuçlarındaki tüm raporları tarar ve kullanıcının sorusuna sadece gerçek verilere dayanan, uydurmasız (no-hallucination) bir sentez cevabı sunar.
- **Mobil Entegrasyon:** Arama sayfasında, hem yapay zekanın özet cevabı (Chatbot) hem de referans aldığı haber kaynakları tek bir şık ekranda birleştirilmiştir.

### 📊 Dashboard & Analitik
- **Aktivite Isı Haritası (Heatmap):** Web arayüzünde GitHub tarzı yeşil kutulardan oluşan kullanım yoğunluğu takvimi.
- **İstatistik Panelleri:** Toplam ajan, aktif ajan oranı, toplam rapor ve beğeni oranlarını gösteren istatistik paneli.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js, Socket.io, node-cron
- **Frontend (Web):** React.js (Vite), TailwindCSS, Axios, React Router, Socket.io-client
- **Mobile (Uygulama):** Expo (React Native), NativeWind (Tailwind v4), Expo Router, React Native Safe Area Context
- **Veritabanı:** MongoDB (Mongoose) — Embedding vektörleri MongoDB içinde native saklanır ve cosine similarity ile sorgulanır.
- **Yapay Zeka (AI):**
  - `gemini-2.5-flash` — Doğal dil işleme, özetleme, soru-cevap, prompt geliştirme.
  - `gemini-embedding-001` — Semantik arama için vektör üretimi.
- **Scraping:** RSS Parser, Cheerio, Axios
- **E-Posta:** Nodemailer (Brevo SMTP API)

---

## 📁 Proje Yapısı

```
agentic/
├── client/                 # React Web Frontend
│   └── src/
│       ├── pages/          # Dashboard, Reports, Search, Profile, vb.
│       ├── components/     # Navbar, ChatWidget, ActivityHeatmap
│       └── ThemeContext.jsx
├── agentic-mobile/         # Expo React Native Mobil Uygulama
│   └── src/
│       ├── app/            # dashboard, reports, search, profile, create-agent (Tablar)
│       ├── components/     # BottomNav (5 Sekmeli Menü)
│       └── context/        # AuthContext (Oturum Yönetimi)
└── server/                 # Node.js Backend API
    └── src/
        ├── controllers/    # Auth, Agent, Report Controller'ları
        ├── models/         # User, Agent, Report Şemaları
        ├── services/       # Gemini, Scraper, Email, Scheduler Servisleri
        └── middleware/
```

---

## 🚀 Kurulum ve Çalıştırma

### 1. Backend Servisi
```bash
cd server
npm install
```
`.env` dosyasını oluşturun:
```env
MONGO_URI=mongodb://localhost:27017/agentic
JWT_SECRET=<gizli-anahtar>
GEMINI_API_KEY=<gemini-api-anahtarı>
EMAIL_USER=<gmail-adresi>
EMAIL_PASS=<gmail-uygulama-şifresi>
PORT=5000
ENABLE_CATCHUP=true
```
Çalıştırmak için:
```bash
node index.js
```

### 2. Web Arayüzü
```bash
cd client
npm install
npm run dev
```
Uygulama **`http://localhost:5173`** adresinde açılacaktır.

### 3. Mobil Uygulama (Expo)
```bash
cd agentic-mobile
npm install
```
Bağlantı ayarı için `src/config.ts` dosyasında `API_URL` adresinin backend sunucunuzu (veya Render adresini) gösterdiğinden emin olun.

#### Geliştirici Modunda Çalıştırma:
```bash
npm run android
```

#### Yerel APK Derleme (Build APK):
Uygulamayı telefonunuza yüklemek üzere yerel olarak paketlemek için (JDK 17 yüklü olmalıdır):
```bash
cd android
.\gradlew.bat clean
.\gradlew.bat assembleDebug
```
Derlenen APK dosyası şu dizinde oluşacaktır:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 👩‍💻 Geliştirici

**Sena Gül Kara** — Samsun Üniversitesi, Yazılım Mühendisliği  
Kodpit bünyesinde staj kapsamında geliştirilmiştir.
