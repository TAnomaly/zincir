# 🔗 Zincir - İş Ortağı Bulma Platformu

Türkiye'deki orta ölçekli işletmelerin birbirini bulup iş birliği yapmasını sağlayan modern web platformu.

## 🚀 Özellikler

### ✨ Temel Özellikler
- **Kullanıcı Yönetimi**: Güvenli kayıt ve giriş sistemi
- **Şirket Profilleri**: Detaylı şirket sayfaları, logo, kapak görseli
- **Gelişmiş Arama**: Sektör, şehir, firma büyüklüğü ve yeteneklere göre filtreleme
- **Akıllı Eşleştirme**: Algoritmik iş ortağı önerileri
- **Bağlantı Sistemi**: İş ortaklığı talepleri gönderme ve kabul etme
- **Mesajlaşma**: Şirketler arası direkt iletişim
- **Portföy Yönetimi**: Projeler, sertifikalar ve yetenekler

### 🎯 Sektörler
25+ farklı sektör desteği:
- Tekstil, Baskı, Pazarlama, Lojistik
- Ambalaj, Tasarım, Yazılım, Üretim
- Gıda, İnşaat, Mobilya, Otomotiv
- Ve daha fazlası...

## 🛠️ Teknoloji Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT & bcrypt

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 📦 Kurulum

### 🐳 Docker ile Kurulum (ÖNERİLEN - Otomatik)

Docker ile **tek komutla** tüm platform çalışır hale gelir!

#### Gereksinimler
- Docker 20.10+
- Docker Compose 2.0+
- Make (opsiyonel)

#### Hızlı Başlangıç

```bash
# Tek komutla başlat
make dev

# Veya docker-compose ile
docker-compose up -d --build
```

**Hepsi bu kadar!** 🎉 Platform otomatik olarak:
- ✅ PostgreSQL veritabanını kurar
- ✅ Migration'ları çalıştırır
- ✅ Backend'i başlatır (http://localhost:3001)
- ✅ Frontend'i başlatır (http://localhost:3000)

**Logları izle:**
```bash
make logs
```

**Durdur:**
```bash
make down
```

**Detaylı bilgi:** [DOCKER.md](DOCKER.md)

---

### 📝 Manuel Kurulum (Docker olmadan)

#### Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- npm veya yarn

#### 1. Repository'yi klonlayın
\`\`\`bash
git clone <repo-url>
cd zincir
\`\`\`

### 2. Bağımlılıkları yükleyin
\`\`\`bash
npm install
\`\`\`

### 3. Veritabanını yapılandırın
Backend .env dosyasını oluşturun:
\`\`\`bash
cd apps/backend
cp .env.example .env
\`\`\`

`.env` dosyasını düzenleyin:
\`\`\`env
DATABASE_URL="postgresql://zincir_user:zincir_password@localhost:5432/zincir_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3001
NODE_ENV=development
\`\`\`

### 4. PostgreSQL veritabanı oluşturun
\`\`\`bash
# PostgreSQL'e bağlanın
psql -U postgres

# Veritabanı ve kullanıcı oluşturun
CREATE DATABASE zincir_db;
CREATE USER zincir_user WITH ENCRYPTED PASSWORD 'zincir_password';
GRANT ALL PRIVILEGES ON DATABASE zincir_db TO zincir_user;
\q
\`\`\`

### 5. Prisma migration'ları çalıştırın
\`\`\`bash
cd apps/backend
npm run db:generate
npm run db:migrate
\`\`\`

### 6. Uygulamayı başlatın

#### Development modunda (önerilen)
\`\`\`bash
# Ana dizinden her iki servisi birden başlat
npm run dev
\`\`\`

#### Servisleri ayrı ayrı başlatma
\`\`\`bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
\`\`\`

### 7. Uygulamayı açın
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## 📁 Proje Yapısı

\`\`\`
zincir/
├── apps/
│   ├── backend/                 # Express.js API
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Veritabanı şeması
│   │   └── src/
│   │       ├── middleware/     # Auth, error handling
│   │       ├── routes/         # API endpoints
│   │       ├── lib/            # Prisma client
│   │       └── server.ts       # Ana sunucu dosyası
│   │
│   └── frontend/               # React uygulaması
│       ├── src/
│       │   ├── components/     # React bileşenleri
│       │   ├── pages/          # Sayfa bileşenleri
│       │   ├── store/          # Zustand store
│       │   ├── lib/            # API client
│       │   ├── types/          # TypeScript tipleri
│       │   └── App.tsx         # Ana uygulama
│       └── index.html
│
├── package.json                # Monorepo yapılandırması
└── README.md
\`\`\`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi

### Companies
- `GET /api/companies` - Şirketleri listele (filtreleme destekli)
- `GET /api/companies/:slug` - Şirket detayı
- `POST /api/companies` - Yeni şirket oluştur (🔒 Auth)
- `PUT /api/companies/:id` - Şirket güncelle (🔒 Auth)
- `POST /api/companies/:id/services` - Hizmet ekle (🔒 Auth)
- `POST /api/companies/:id/capabilities` - Yetenek ekle (🔒 Auth)

### Connections
- `POST /api/connections` - Bağlantı isteği gönder (🔒 Auth)
- `GET /api/connections/received` - Gelen istekler (🔒 Auth)
- `GET /api/connections/sent` - Gönderilen istekler (🔒 Auth)
- `GET /api/connections/accepted` - Kabul edilmiş bağlantılar (🔒 Auth)
- `PUT /api/connections/:id/accept` - İsteği kabul et (🔒 Auth)
- `PUT /api/connections/:id/reject` - İsteği reddet (🔒 Auth)

### Messages
- `POST /api/messages` - Mesaj gönder (🔒 Auth)
- `GET /api/messages/inbox` - Gelen mesajlar (🔒 Auth)
- `GET /api/messages/sent` - Gönderilen mesajlar (🔒 Auth)
- `PUT /api/messages/:id/read` - Mesajı okundu işaretle (🔒 Auth)
- `GET /api/messages/unread-count` - Okunmamış mesaj sayısı (🔒 Auth)

### Search
- `GET /api/search` - Gelişmiş arama
- `GET /api/search/recommendations` - Önerilen şirketler
- `GET /api/search/popular` - Popüler aramalar

## 🎨 Kullanıcı Arayüzü

### Sayfalar
- **Ana Sayfa** (`/`) - Platform tanıtımı
- **Şirketler** (`/companies`) - Şirket listesi ve filtreleme
- **Şirket Detay** (`/companies/:slug`) - Detaylı şirket profili
- **Arama** (`/search`) - Gelişmiş arama
- **Kayıt** (`/register`) - Kullanıcı kaydı
- **Giriş** (`/login`) - Kullanıcı girişi
- **Şirket Oluştur** (`/create-company`) - Yeni şirket profili (🔒)
- **Panel** (`/dashboard`) - Bağlantı yönetimi (🔒)
- **Mesajlar** (`/messages`) - Mesajlaşma (🔒)

## 🎯 Özellik Detayları

### Akıllı Eşleştirme Algoritması
Platform, şirketlere en uygun iş ortaklarını önermek için şu kriterleri kullanır:
1. Aynı veya tamamlayıcı sektörler
2. Coğrafi yakınlık (aynı şehir/bölge)
3. Benzer hizmet kategorileri
4. Firma büyüklüğü uyumu

### Güvenlik
- JWT tabanlı authentication
- Bcrypt ile şifre hashleme
- SQL injection koruması (Prisma ORM)
- XSS koruması
- CORS yapılandırması

## 🚀 Production Deployment

### Backend Build
\`\`\`bash
cd apps/backend
npm run build
npm start
\`\`\`

### Frontend Build
\`\`\`bash
cd apps/frontend
npm run build
# dist/ klasörü static hosting için hazır
\`\`\`

### Environment Variables (Production)
\`\`\`env
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="production-secret-key-min-32-characters"
PORT=3001
NODE_ENV=production
\`\`\`

## 📊 Veritabanı Şeması

### Ana Tablolar
- **User**: Kullanıcılar
- **Company**: Şirket profilleri
- **Service**: Şirket hizmetleri
- **Capability**: Şirket yetenekleri
- **Certification**: Sertifikalar
- **PortfolioItem**: Portföy öğeleri
- **Connection**: Bağlantı istekleri
- **Message**: Mesajlar
- **Favorite**: Favoriler
- **SearchLog**: Arama logları

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👥 İletişim

Proje Sahibi - Zincir Ekibi

---

**Zincir** ile Türkiye'nin iş ağını güçlendiriyoruz! 🇹🇷
