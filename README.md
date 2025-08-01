# Saha Asistan - İş Takip ve Saha Yönetimi Uygulaması

Bu proje, saha ekiplerinin iş takibi için tasarlanmış **web ve mobile uyumlu** bir uygulamadır. Modern React teknolojileri, OpenLayers harita entegrasyonu ve PWA desteği ile geliştirilmiştir.

## 🛠️ Teknoloji Yığını

### Frontend
- **React 19.1.0** - Modern hooks ve fonksiyonel bileşenler
- **TypeScript** - Tip güvenliği ve geliştirici deneyimi
- **OpenLayers 10.6.1** - Güçlü harita ve GIS çözümü
- **Material-UI 7.2.0** - Modern UI bileşenleri
- **Tailwind CSS 4.1.11** - Mobile-first responsive tasarım
- **Vite 7.0.4** - Hızlı build aracı

### Backend
- **Node.js + Express** - RESTful API
- **PostgreSQL + PostGIS** - Coğrafi veriler için veritabanı
- **TypeScript** - Backend tip güvenliği

### Diğer
- **Docker Compose** - Geliştirme ortamı
- **PWA Ready** - Progressive Web App desteği

## 🚀 Hızlı Başlangıç

### 1. Veritabanı Kurulumu (Docker)

Proje PostgreSQL + PostGIS gerektirir. Docker Compose ile kolayca başlatabilirsiniz:

```bash
docker-compose up -d
```

Bu komut PostgreSQL veritabanını `localhost:5466` portunda başlatır.

### 2. Backend Kurulumu

```bash
cd backend
npm install
npx tsc
node dist/index.js
```

Backend API `http://localhost:4000` adresinde çalışır ve otomatik olarak:
- Veritabanı tablolarını oluşturur
- Gerekli alanları kontrol eder ve ekler

### 3. Frontend Kurulumu

```bash
# Ana dizinde
npm install
npm run dev
```

Uygulama `http://localhost:5173` adresinde açılır.

## 📋 Ana Özellikler

### 👥 Kullanıcı Yönetimi
- **3 Rol Seviyesi**: Superadmin, Yönetici, Personel
- **Detaylı Profil Bilgileri**: Fotoğraf, sosyal medya, iletişim
- **Birim Bazlı Organizasyon**: Hiyerarşik birim yapısı
- **Aktif/Pasif Durum Yönetimi**

### 📱 İş Yönetimi
- **Dinamik Form Sistemi**: Özelleştirilebilir iş formları
- **Iş Durumları**: Atandı, Başladı, Devam, Tamamlandı, İptal
- **İş Devretme**: Birim içi ve alt birimler arası atama
- **İş Geçmişi**: Tüm işlem kayıtları
- **Öncelik Seviyeleri**: Acil, Normal, Düşük

### 🗺️ Harita Entegrasyonu (OpenLayers)
- **Çoklu Harita Katmanları**: OSM, Google, Bing desteği
- **Konum Bazlı İş Atama**: Harita üzerinde iş lokasyonları
- **Geocoding**: Adres-koordinat dönüşümü
- **Mobil Harita Desteği**: Touch gestures, zoom optimizasyonu

### 📊 Form Sistemi
- **11 Farklı Alan Türü**: Text, Number, Select, Radio, Checkbox, Date, Time, Photo, Signature, Rating, Yes/No
- **Form Şablonları**: Yeniden kullanılabilir form tasarımları
- **Mobil Optimizasyon**: Dokunmatik cihazlar için optimize edilmiş
- **Otomatik Kaydetme**: Veri kaybı önleme

### 📱 Mobil Uyumluluk
- **Responsive Tasarım**: Tüm ekran boyutlarında uyumlu
- **PWA Desteği**: Native app benzeri deneyim
- **Offline Çalışma**: İnternet bağlantısı olmadan form doldurma
- **Touch Optimizasyon**: Mobil cihazlar için optimize edilmiş arayüz

## 🔧 Geliştirme

### Ortam Değişkenleri

Backend için `.env` dosyası oluşturun:
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5466
POSTGRES_USER=sahaasistan
POSTGRES_PASSWORD=sahaasistan123
POSTGRES_DB=sahaasistan
BACKEND_PORT=4000
```

### Veritabanı Yapısı

Uygulama otomatik olarak şu tabloları oluşturur:
- `users` - Kullanıcı bilgileri
- `units` - Birim/departman bilgileri  
- `forms` - Dinamik form şemaları
- `jobs` - İş kayıtları
- `job_history` - İş geçmişi kayıtları

### Build ve Dağıtım

```bash
# Production build
npm run build

# Preview production build
npm run preview

# Backend build
cd backend
npx tsc
```

## 🔐 İlk Kurulum

### Superadmin Kullanıcısı Oluşturma

Veritabanına doğrudan superadmin kullanıcısı eklemek için:

```sql
INSERT INTO users (username, password_hash, display_name, role)
VALUES ('superadmin', '$2a$10$YOUR_GENERATED_HASH', 'Süper Admin', 'superadmin')
ON CONFLICT (username) DO NOTHING;
```

Güvenli hash üretmek için:
```js
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('your_password', 10));
```

## 📁 Proje Yapısı

```
├── src/
│   ├── components/          # React bileşenleri
│   │   ├── AdminPanel.tsx   # Yönetici paneli
│   │   ├── JobCreateForm.tsx # İş oluşturma formu
│   │   ├── MapComponent.tsx  # Harita bileşeni
│   │   └── ...
│   ├── data/               # Veri tipleri
│   ├── services/           # API servisleri
│   └── App.tsx            # Ana uygulama
├── backend/
│   ├── api.ts             # API rotaları
│   ├── db-checker.ts      # Veritabanı migration
│   └── index.ts           # Backend entry point
└── public/                # Statik dosyalar
```

## 🤝 Katkıda Bulunma

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

## 📖 Dokümantasyon

Detaylı teknik dokümantasyon için `appdoc.md` dosyasını inceleyiniz. Bu dosya şunları içerir:
- Kapsamlı özellik listesi
- Teknik mimari detayları
- Kullanım senaryoları
- Gelecek geliştirme planları

## 🐛 Sorun Giderme

### Yaygın Sorunlar

1. **Veritabanı bağlantı hatası**: Docker container'ının çalıştığından emin olun
2. **Port çakışması**: 4000 ve 5173 portlarının boş olduğunu kontrol edin
3. **TypeScript hataları**: `npm install` komutunu tekrar çalıştırın

### Loglama

Backend logları için:
```bash
cd backend
node dist/index.js
```

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

### Superadmin Kullanıcısı Oluşturma (Güvenli Şifre ile)

Aşağıdaki komut ile bcrypt ile hashlenmiş şifreyle superadmin ekleyebilirsiniz:

Örnek şifre: `superadmin123` için hash (bcrypt):

```
$2a$10$Q9Qw1Qw1Qw1Qw1Qw1Qw1QeQw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Q
```

SQL:
```sql
INSERT INTO users (username, password_hash, display_name, role)
VALUES ('superadmin', '$2a$10$Q9Qw1Qw1Qw1Qw1Qw1Qw1QeQw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Q', 'Süper Admin', 'superadmin')
ON CONFLICT (username) DO NOTHING;
```

Gerçek hash'i kendi ortamınızda üretmek için Node.js ile:
```js
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('superadmin123', 10));
```
git reset --hard HEAD