# 🐳 Zincir Docker Kurulum Kılavuzu

Bu kılavuz, Zincir platformunu Docker ile tamamen otomatik olarak nasıl çalıştıracağınızı gösterir.

## 📋 Gereksinimler

Sisteminizde yüklü olması gerekenler:
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Make** (opsiyonel, kolaylık için)

### Docker Kurulumu

#### Ubuntu/Debian
\`\`\`bash
# Docker kurulumu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose kurulumu
sudo apt-get install docker-compose-plugin

# Kullanıcıyı docker grubuna ekle
sudo usermod -aG docker $USER
newgrp docker
\`\`\`

#### Fedora/CentOS
\`\`\`bash
sudo dnf install docker docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
newgrp docker
\`\`\`

## 🚀 Hızlı Başlangıç

### Yöntem 1: Make ile (Önerilen)

\`\`\`bash
# Projeyi başlat
make dev

# Logları izle
make logs

# Durdur
make down
\`\`\`

### Yöntem 2: Docker Compose ile

\`\`\`bash
# Build ve başlat
docker-compose up -d --build

# Logları izle
docker-compose logs -f

# Durdur
docker-compose down
\`\`\`

## 📱 Erişim

Servisler başlatıldıktan sonra:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432
- **API Health**: http://localhost:3001/api/health

## 🛠️ Komutlar

### Make Komutları

\`\`\`bash
make help              # Tüm komutları listele
make build             # Docker imajlarını oluştur
make up                # Servisleri başlat
make down              # Servisleri durdur
make logs              # Tüm logları göster
make logs-backend      # Backend logları
make logs-frontend     # Frontend logları
make logs-db           # Database logları
make restart           # Yeniden başlat
make clean             # Tüm kaynakları temizle
make shell-backend     # Backend container'a bağlan
make shell-frontend    # Frontend container'a bağlan
make shell-db          # PostgreSQL'e bağlan
make migrate           # Migration çalıştır
make status            # Container durumları
\`\`\`

### Docker Compose Komutları

\`\`\`bash
# Servisleri başlat
docker-compose up -d

# Build ile başlat
docker-compose up -d --build

# Servisleri durdur
docker-compose down

# Tüm verileri sil
docker-compose down -v

# Logları göster
docker-compose logs -f

# Belirli bir servisin logları
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Container'ları yeniden başlat
docker-compose restart

# Container durumları
docker-compose ps

# Backend shell
docker-compose exec backend sh

# PostgreSQL shell
docker-compose exec postgres psql -U zincir_user -d zincir_db
\`\`\`

## 🗄️ Veritabanı İşlemleri

### Migration Çalıştırma

\`\`\`bash
# Development migration
make migrate

# Ya da
docker-compose exec backend npx prisma migrate dev

# Production migration
docker-compose exec backend npx prisma migrate deploy
\`\`\`

### Prisma Studio

\`\`\`bash
docker-compose exec backend npx prisma studio
\`\`\`
Ardından http://localhost:5555 adresini ziyaret edin.

### Veritabanı Backup

\`\`\`bash
# Backup al
docker-compose exec postgres pg_dump -U zincir_user zincir_db > backup.sql

# Backup geri yükle
cat backup.sql | docker-compose exec -T postgres psql -U zincir_user -d zincir_db
\`\`\`

## 🏗️ Servis Yapısı

### postgres
- **Image**: PostgreSQL 15 Alpine
- **Port**: 5432
- **Database**: zincir_db
- **User**: zincir_user
- **Password**: zincir_password
- **Volume**: postgres_data

### backend
- **Build**: apps/backend
- **Port**: 3001
- **Environment**: Development
- **Depends**: postgres

### frontend
- **Build**: apps/frontend
- **Port**: 3000
- **Depends**: backend

## 🔧 Yapılandırma

### Environment Variables

Backend için özel .env kullanmak isterseniz:

\`\`\`bash
# apps/backend/.env.docker
DATABASE_URL="postgresql://zincir_user:zincir_password@postgres:5432/zincir_db?schema=public"
JWT_SECRET="your-custom-secret"
PORT=3001
NODE_ENV=development
\`\`\`

docker-compose.yml'de env_file ekleyin:
\`\`\`yaml
backend:
  env_file:
    - ./apps/backend/.env.docker
\`\`\`

### Port Değiştirme

docker-compose.yml dosyasında port'ları değiştirebilirsiniz:

\`\`\`yaml
services:
  frontend:
    ports:
      - "8080:3000"  # localhost:8080

  backend:
    ports:
      - "8081:3001"  # localhost:8081
\`\`\`

## 🚢 Production Deployment

Production için ayrı bir compose dosyası var:

\`\`\`bash
# Production build
make prod

# Ya da
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
\`\`\`

Production'da:
- Frontend Nginx ile serve edilir
- Optimized build
- Hot reload kapalı
- Production environment variables

## 🐛 Sorun Giderme

### Container başlamıyor
\`\`\`bash
# Logları kontrol edin
docker-compose logs backend

# Container'ı yeniden oluşturun
docker-compose up -d --force-recreate backend
\`\`\`

### Database bağlantı hatası
\`\`\`bash
# PostgreSQL'in hazır olduğunu kontrol edin
docker-compose exec postgres pg_isready -U zincir_user

# Database restart
docker-compose restart postgres
\`\`\`

### Port zaten kullanımda
\`\`\`bash
# Port kullanan process'i bulun
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :5432

# Process'i durdurun veya docker-compose.yml'de port değiştirin
\`\`\`

### Volume sorunları
\`\`\`bash
# Tüm volume'leri sil ve yeniden başlat
docker-compose down -v
docker-compose up -d --build
\`\`\`

### Node modules cache
\`\`\`bash
# Cache'i temizle
docker-compose down
docker volume rm zincir_backend_node_modules zincir_frontend_node_modules
docker-compose up -d --build
\`\`\`

## 🧹 Temizlik

### Hafif temizlik
\`\`\`bash
# Sadece container'ları durdur
docker-compose down
\`\`\`

### Orta temizlik
\`\`\`bash
# Container'ları ve network'leri sil
make down
\`\`\`

### Tam temizlik
\`\`\`bash
# Tüm container, volume, image'leri sil
make clean

# Sistem geneli Docker temizliği
make prune
\`\`\`

## 📊 Monitoring

### Container kaynak kullanımı
\`\`\`bash
docker stats
\`\`\`

### Container detayları
\`\`\`bash
docker-compose ps
docker inspect zincir-backend
\`\`\`

## 🔒 Güvenlik

Production'da mutlaka:

1. **JWT Secret değiştirin**
   \`\`\`yaml
   environment:
     JWT_SECRET: "çok-güçlü-ve-uzun-bir-secret-key"
   \`\`\`

2. **Database şifresi değiştirin**
   \`\`\`yaml
   environment:
     POSTGRES_PASSWORD: "güçlü-şifre"
   \`\`\`

3. **Port'ları expose etmeyin** (sadece reverse proxy üzerinden)
   \`\`\`yaml
   ports:
     - "127.0.0.1:3001:3001"  # Sadece localhost
   \`\`\`

## 📝 Notlar

- İlk başlatma 2-3 dakika sürebilir (image download + build)
- Hot reload aktif, kod değişiklikleri otomatik yansır
- Database verileri volume'de saklanır, container silinse bile korunur
- Production'da mutlaka environment variables'ları değiştirin

## 🆘 Yardım

Sorun yaşarsanız:

1. Logları kontrol edin: \`make logs\`
2. Container durumlarını kontrol edin: \`make status\`
3. Tam temizlik yapıp yeniden başlatın: \`make clean && make dev\`

---

**Docker ile kolay kurulum!** 🐳
