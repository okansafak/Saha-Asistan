# Saha Asistan - İş Takip ve Saha Yönetimi Uygulaması

Bu proje, modern React (TypeScript), OpenLayers harita entegrasyonu, Tailwind CSS ve PWA desteği ile geliştirilmiş, mobil uyumlu bir iş takip ve saha yönetimi uygulamasıdır.

Tüm teknik ve fonksiyonel detaylar için lütfen appdoc.md dosyasını inceleyin.

## Backend Başlatma

Backend API'yi başlatmak için:

1. Terminalde backend klasörüne geçin:
   ```bash
   cd backend
   ```
2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
3. TypeScript dosyalarını derleyin:
   ```bash
   npx tsc
   ```
4. Sunucuyu başlatın:
   ```bash
   node dist/index.js
   ```

API varsayılan olarak http://localhost:4000 adresinde çalışır.

## Frontend Başlatma

1. Ana dizinde bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
2. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```
3. Uygulamayı tarayıcıda görüntüleyin:
   ```
   http://localhost:5173
   ```

## Özellikler
- React 18+, TypeScript, OpenLayers, Tailwind CSS, PWA
- Dinamik iş formları, harita ve adres entegrasyonu, mobil optimizasyon

Daha fazla bilgi için appdoc.md dosyasına bakınız.

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

git reset --hard HEAD
```