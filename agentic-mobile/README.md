# Agentic Mobile 📱

**Kişisel AI Ekosistem Platformu Mobil Uygulaması** — Kullanıcıların otonom çalışan yapay zeka ajanlarını (AI Agents) yönettikleri, canlı Socket.io durum güncellemelerini takip ettikleri, yapay zekanın ürettiği raporları okuyup paylaştıkları ve RAG tabanlı arama yaptıkları hibrit React Native (Expo) uygulamasıdır.

Bu mobil uygulama, web arayüzüyle tam senkronize şekilde çalışarak kullanıcılara eksiksiz bir mobil SaaS deneyimi sunar.

---

## ✨ Özellikler

### 🤖 1. Ajanlar (Dashboard)
- **Canlı Socket Takibi:** Ajanların çalışma süreçleri (kaynak tarama, embedding oluşturma, özetleme adımları) Socket.io üzerinden canlı olarak izlenir.
- **Ajan Yönetimi:** Tek dokunuşla ajanları aktif/pasif yapma, anlık çalıştırma (▶ Çalıştır), düzenleme (ad, açıklama, konular, saat) ve güvenli silme (🗑️ Sil) işlemleri yapılabilir.
- **Pull-To-Refresh:** Sayfayı aşağı çekerek anlık verileri yenileme refleks desteği.

### ➕ 2. Yeni Ajan Ekleme (Create Agent)
- **Doğal Dil Girişi:** Ajanın ne yapması gerektiği düz metin olarak yazılır (Örn: *"Döviz hareketlerini izle"*).
- **AI Geliştir (Sihirli Değnek):** Tek tıkla yazılan basit fikir, Gemini API kullanılarak detaylı bir ajan komutuna (prompt) zenginleştirilir.
- **Hazır Şablonlar:** Sık kullanılan ajan fikirleri için hızlı başlangıç şablon kartları.

### 📋 3. Rapor Arşivi (Reports)
- **Akordeon Tasarım:** Günlük rapor özetleri, tıklandığında genişleyen şık kartlar halinde listelenir.
- **Kaynak Haberler:** Raporun referans aldığı web sitelerinin listesi, tıklandığında telefonun varsayılan tarayıcısında açılacak bağlantılarla gösterilir.
- **Geri Bildirim (Feedback):** Raporlara Beğendim (👍) ve Beğenmedim (👎) oyları verilerek yapay zekanın kaynak seçimi iyileştirilir.
- **📤 Paylaş (Native Share):** Rapor özet metni tek tıkla telefonun yerel paylaşım menüsü üzerinden (WhatsApp, Mail vb.) gönderilebilir.

### 🔍 4. Arama & AI Asistanı (RAG Search)
- **Semantik Arama:** Geçmiş raporlar içinde doğal dille anlam bazlı akıllı arama yapılır.
- **Asistan Cevabı:** Yapay zeka, arama sonuçlarını sentezleyerek üstte şık mor bir kartta doğrudan sorunuza yanıt verir (hallucination içermez). Altta ise kaynak haberlerin eşleşme yüzdeleri (% Eşleşme) gösterilir.

### 👤 5. Profil & İstatistik (Profile)
- Kullanıcının hesap bilgileri, toplam ajan sayısı, aktif çalışan ajan sayısı ve beğenilen rapor istatistikleri görsel kartlarla sunulur.
- Güvenli çıkış yapma (Logout) kontrolü barındırır.

---

## 🛠️ Teknolojiler

- **Framework:** Expo SDK (React Native)
- **Yönlendirme:** Expo Router (Dosya tabanlı navigasyon)
- **Tasarım:** NativeWind (TailwindCSS v3 — Sleek Dark Mode)
- **Ağ İletişimi:** Axios, Socket.io-client
- **Konumlandırma:** React Native Safe Area Context

---

## 📁 Proje Klasör Yapısı

    agentic-mobile/
      src/
        app/                    Sayfalar (Expo Router)
          _layout.tsx           Kök yapılandırma ve Auth sağlayıcı
          login.tsx             Giriş Yap sayfası
          register.tsx          Kayıt Ol sayfası
          dashboard.tsx         Ajan listesi ve kontrol paneli
          create-agent.tsx      Yeni ajan ekleme ekranı
          reports.tsx           Rapor arşivi
          search.tsx            RAG Arama ve AI Asistanı
          profile.tsx           Profil ve istatistik sayfası
        components/
          BottomNav.tsx         5 sekmeli alt menü bileşeni
        context/
          AuthContext.tsx       JWT token ve oturum yönetimi
        config.ts                Sunucu URL ayarları
        global.css                Küresel TailwindCSS stilleri


---

## 🚀 Kurulum ve Çalıştırma

### 1. Bağımlılıkları Yükleme
```bash
npm install
```

### 2. Yapılandırma
`src/config.ts` dosyasında `API_URL` adresinin backend sunucunuzu gösterdiğinden emin olun:
```ts
export const API_URL = "https://agentic-468i.onrender.com";
```

### 3. Geliştirici Modunda Başlatma
Android emülatörünüz veya fiziksel cihazınız bağlıyken:
```bash
npm run android
```

### 4. Yerel APK Derleme (Build APK)
Fiziksel cihazlara kurulabilecek debug `.apk` paketi üretmek için (JDK 17 kurulu olmalı):
```bash
cd android
.\gradlew.bat clean
.\gradlew.bat assembleDebug
```
Derleme bittiğinde APK dosyanız şu dizinde hazır olacaktır:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 👩‍💻 Geliştirici

**Sena Gül Kara** — Samsun Üniversitesi, Yazılım Mühendisliği
