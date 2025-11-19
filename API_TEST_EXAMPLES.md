# 🧪 Zincir API - Test Örnekleri

Hızlı test için hazır curl komutları.

---

## 🏥 Health Check

```bash
curl http://localhost:3001/api/health
```

**Beklenen Yanıt:**
```json
{"status":"ok","timestamp":"2025-11-16T21:08:25.108Z"}
```

---

## 🔐 Authentication

### Kayıt Ol
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

### Giriş Yap
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

**Token'ı kaydedin:**
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Profil Bilgisi
```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🏢 Company API

### Tüm Şirketleri Listele
```bash
curl http://localhost:3001/api/companies
```

### Sektöre Göre Filtrele
```bash
curl "http://localhost:3001/api/companies?industry=TEKSTIL"
```

### Şehre Göre Filtrele
```bash
curl "http://localhost:3001/api/companies?city=İstanbul"
```

### Şirket Detayı
```bash
curl http://localhost:3001/api/companies/sirket-slug
```

### Şirket Oluştur
```bash
curl -X POST http://localhost:3001/api/companies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Örnek Tekstil",
    "description": "Kaliteli tekstil ürünleri üretiyoruz",
    "phone": "+90 555 123 4567",
    "email": "info@ornektekstil.com",
    "address": "Örnek Mahallesi, Test Sok. No:1",
    "city": "İstanbul",
    "district": "Kadıköy",
    "industryType": "TEKSTIL",
    "companySize": "MEDIUM",
    "foundedYear": 2015
  }'
```

---

## 📦 Products API

### Ürünleri Listele
```bash
curl http://localhost:3001/api/products
```

### Kategoriye Göre Filtrele
```bash
curl "http://localhost:3001/api/products?category=Tekstil"
```

### Fiyat Aralığı
```bash
curl "http://localhost:3001/api/products?minPrice=100&maxPrice=1000"
```

### Ürün Oluştur
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pamuklu T-Shirt",
    "description": "%100 pamuklu, yüksek kalite",
    "category": "Tekstil",
    "price": 150.00,
    "currency": "TRY",
    "unit": "adet",
    "minOrderQuantity": 100,
    "stock": 5000,
    "tags": ["pamuk", "tshirt", "tekstil"]
  }'
```

### Ürün Resmi Ekle
```bash
curl -X POST http://localhost:3001/api/products/{PRODUCT_ID}/images \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "images": [
      {
        "imageUrl": "https://example.com/image1.jpg",
        "order": 0
      },
      {
        "imageUrl": "https://example.com/image2.jpg",
        "order": 1
      }
    ]
  }'
```

### Ürüne Yorum Yap
```bash
curl -X POST http://localhost:3001/api/products/{PRODUCT_ID}/reviews \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Harika ürün, çok memnun kaldık!"
  }'
```

---

## 🎥 Videos API

### Videoları Listele
```bash
curl http://localhost:3001/api/videos
```

### Şirkete Göre Filtrele
```bash
curl "http://localhost:3001/api/videos?companyId={COMPANY_ID}"
```

### Video Ekle
```bash
curl -X POST http://localhost:3001/api/videos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ürün Tanıtım Videosu",
    "description": "Yeni ürünlerimizi tanıtıyoruz",
    "url": "https://youtube.com/watch?v=abc123",
    "category": "Ürün Tanıtımı"
  }'
```

---

## ⭐ Reviews API

### Şirket Yorumlarını Listele
```bash
curl "http://localhost:3001/api/reviews?companyId={COMPANY_ID}"
```

### Şirket İstatistikleri
```bash
curl http://localhost:3001/api/reviews/stats/{COMPANY_ID}
```

### Yorum Ekle
```bash
curl -X POST http://localhost:3001/api/reviews \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "{COMPANY_ID}",
    "rating": 5,
    "title": "Mükemmel İş Ortağı",
    "comment": "Çok profesyonel ve zamanında teslim",
    "communicationRating": 5,
    "qualityRating": 5,
    "timelinessRating": 5
  }'
```

---

## 📝 Blog API

### Blog Yazılarını Listele
```bash
curl http://localhost:3001/api/blog
```

### Blog Yazısı Detayı
```bash
curl http://localhost:3001/api/blog/{SLUG}
```

### Blog Yazısı Oluştur
```bash
curl -X POST http://localhost:3001/api/blog \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Yeni Ürün Lansmanımız",
    "content": "# Başlık\n\nMarkdown formatında içerik...",
    "excerpt": "Kısa özet",
    "tags": ["ürün", "lansman", "haber"],
    "isPublished": true
  }'
```

---

## 📊 Analytics API

### Dashboard
```bash
curl http://localhost:3001/api/analytics/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

### Popüler Aramalar
```bash
curl "http://localhost:3001/api/analytics/popular-searches?days=30&limit=10"
```

### Trend Sektörler
```bash
curl "http://localhost:3001/api/analytics/trending-industries?days=30"
```

### Platform İstatistikleri
```bash
curl http://localhost:3001/api/analytics/platform-stats
```

### Şirket Raporu
```bash
curl "http://localhost:3001/api/analytics/company-report/{COMPANY_ID}?period=month"
```

---

## 🔔 Notifications API

### Bildirimleri Listele
```bash
curl http://localhost:3001/api/notifications \
  -H "Authorization: Bearer $TOKEN"
```

### Okunmamış Bildirimler
```bash
curl "http://localhost:3001/api/notifications?isRead=false" \
  -H "Authorization: Bearer $TOKEN"
```

### Bildirimi Okundu İşaretle
```bash
curl -X PUT http://localhost:3001/api/notifications/{NOTIFICATION_ID}/read \
  -H "Authorization: Bearer $TOKEN"
```

### Tümünü Okundu İşaretle
```bash
curl -X PUT http://localhost:3001/api/notifications/mark-all-read \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🤝 Connections API

### Bağlantıları Listele
```bash
curl http://localhost:3001/api/connections \
  -H "Authorization: Bearer $TOKEN"
```

### Bekleyen İstekler
```bash
curl "http://localhost:3001/api/connections?status=PENDING" \
  -H "Authorization: Bearer $TOKEN"
```

### Gönderilen İstekler
```bash
curl "http://localhost:3001/api/connections?type=sent" \
  -H "Authorization: Bearer $TOKEN"
```

### Bağlantı İsteği Gönder
```bash
curl -X POST http://localhost:3001/api/connections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "toCompanyId": "{COMPANY_ID}",
    "message": "Merhaba, iş ortaklığı kurmak isteriz"
  }'
```

### İsteği Kabul Et
```bash
curl -X PUT http://localhost:3001/api/connections/{CONNECTION_ID}/accept \
  -H "Authorization: Bearer $TOKEN"
```

### İsteği Reddet
```bash
curl -X PUT http://localhost:3001/api/connections/{CONNECTION_ID}/reject \
  -H "Authorization: Bearer $TOKEN"
```

---

## 💬 Messages API

### Mesajları Listele
```bash
curl http://localhost:3001/api/messages \
  -H "Authorization: Bearer $TOKEN"
```

### Gelen Mesajlar
```bash
curl "http://localhost:3001/api/messages?type=received" \
  -H "Authorization: Bearer $TOKEN"
```

### Okunmamış Mesajlar
```bash
curl "http://localhost:3001/api/messages?isRead=false" \
  -H "Authorization: Bearer $TOKEN"
```

### Mesaj Gönder
```bash
curl -X POST http://localhost:3001/api/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "toCompanyId": "{COMPANY_ID}",
    "subject": "Teklif Talebi",
    "content": "Merhaba, ürünleriniz hakkında teklif almak istiyoruz..."
  }'
```

---

## 🔍 Search API

### Basit Arama
```bash
curl "http://localhost:3001/api/search?query=tekstil"
```

### Gelişmiş Arama
```bash
curl "http://localhost:3001/api/search?query=pamuk&industries=TEKSTIL,BASKI&cities=İstanbul&seekingPartners=true"
```

### Sayfalama
```bash
curl "http://localhost:3001/api/search?query=tekstil&page=2&limit=10"
```

---

## 🎨 Postman Collection

Bu komutları Postman'de kullanmak için:

1. Postman'i açın
2. Import → Raw Text
3. Aşağıdaki curl komutlarını yapıştırın
4. Otomatik olarak collection oluşturulur

---

## 🔧 Environment Variables

Test için `.env` değişkenleri:

```bash
# Backend
DATABASE_URL="postgresql://zincir_user:zincir_password@localhost:5432/zincir_db"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3001

# Test için export
export API_URL="http://localhost:3001/api"
export TOKEN="your-jwt-token-here"
```

---

## 📝 Notlar

1. **{COMPANY_ID}**, **{PRODUCT_ID}**, vb. değerlerini gerçek ID'lerle değiştirin
2. **$TOKEN** yerine gerçek JWT token kullanın
3. Tüm POST/PUT istekleri `Content-Type: application/json` header gerektirir
4. Korumalı endpoint'ler için `Authorization: Bearer $TOKEN` header gereklidir

---

## 🚀 Hızlı Test Senaryosu

```bash
# 1. Kayıt ol
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# 2. Giriş yap ve token al
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}' \
  | jq -r '.token')

# 3. Şirket oluştur
curl -X POST http://localhost:3001/api/companies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Şirketi",
    "description": "Test açıklaması",
    "phone": "+90 555 123 4567",
    "email": "info@test.com",
    "address": "Test Mahallesi",
    "city": "İstanbul",
    "industryType": "TEKSTIL",
    "companySize": "MEDIUM"
  }'

# 4. Şirketleri listele
curl http://localhost:3001/api/companies

# 5. Dashboard'u görüntüle
curl http://localhost:3001/api/analytics/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

---

**Happy Testing!** 🧪
