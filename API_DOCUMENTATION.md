# Zincir Platform - API Dokümantasyonu

## 🌐 Base URL
```
http://localhost:3001/api
```

## 🔐 Authentication

Tüm korumalı endpoint'ler için JWT token gereklidir.

**Header:**
```
Authorization: Bearer <token>
```

---

## 📋 İçindekiler

1. [Authentication](#authentication-api)
2. [Company Management](#company-api)
3. [Products](#products-api)
4. [Videos](#videos-api)
5. [Media Gallery](#gallery-api)
6. [Reviews](#reviews-api)
7. [Blog](#blog-api)
8. [Analytics](#analytics-api)
9. [Notifications](#notifications-api)
10. [FAQ](#faq-api)
11. [Connections](#connections-api)
12. [Messages](#messages-api)
13. [Search](#search-api)

---

## 🔑 Authentication API

### Kayıt Ol
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "role": "USER"
  }
}
```

### Giriş Yap
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "role": "USER",
    "company": {
      "id": "uuid",
      "name": "Şirket Adı",
      "slug": "sirket-adi"
    }
  }
}
```

### Profil Bilgisi
```http
GET /api/auth/me
Headers: Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "test@example.com",
  "role": "USER",
  "company": { ... }
}
```

---

## 🏢 Company API

### Tüm Şirketleri Listele
```http
GET /api/companies
Query Parameters:
  - industry: TEKSTIL, BASKI, PAZARLAMA, etc.
  - city: İstanbul, Ankara, etc.
  - search: arama terimi
  - page: sayfa numarası (default: 1)
  - limit: sayfa başına kayıt (default: 20)
```

**Response:**
```json
{
  "companies": [
    {
      "id": "uuid",
      "name": "Şirket Adı",
      "slug": "sirket-adi",
      "description": "Şirket açıklaması",
      "logo": "https://example.com/logo.png",
      "coverImage": "https://example.com/cover.jpg",
      "industryType": "TEKSTIL",
      "city": "İstanbul",
      "viewCount": 150,
      "connectionCount": 25,
      "isPremium": false
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Şirket Detayı
```http
GET /api/companies/:slug
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Şirket Adı",
  "slug": "sirket-adi",
  "description": "Detaylı açıklama",
  "logo": "url",
  "coverImage": "url",
  "phone": "+90 555 123 4567",
  "email": "info@sirket.com",
  "website": "https://sirket.com",
  "address": "Tam adres",
  "city": "İstanbul",
  "district": "Kadıköy",
  "industryType": "TEKSTIL",
  "companySize": "MEDIUM",
  "foundedYear": 2015,
  "seekingPartners": true,
  "viewCount": 150,
  "connectionCount": 25,
  "services": [
    {
      "id": "uuid",
      "title": "Hizmet Adı",
      "description": "Hizmet açıklaması",
      "category": "Üretim"
    }
  ],
  "capabilities": [
    {
      "id": "uuid",
      "name": "Yetenek",
      "level": "EXPERT",
      "yearsExp": 10
    }
  ],
  "certifications": [
    {
      "id": "uuid",
      "name": "ISO 9001",
      "issuer": "TÜV",
      "issueDate": "2020-01-01",
      "imageUrl": "url"
    }
  ],
  "portfolio": [
    {
      "id": "uuid",
      "title": "Proje Adı",
      "description": "Proje açıklaması",
      "imageUrl": "url",
      "tags": ["etiket1", "etiket2"]
    }
  ]
}
```

### Şirket Oluştur
```http
POST /api/companies
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Şirket Adı",
  "description": "Açıklama",
  "phone": "+90 555 123 4567",
  "email": "info@sirket.com",
  "address": "Adres",
  "city": "İstanbul",
  "district": "Kadıköy",
  "industryType": "TEKSTIL",
  "companySize": "MEDIUM",
  "foundedYear": 2015,
  "logo": "url",
  "coverImage": "url",
  "website": "https://sirket.com"
}
```

### Şirket Güncelle
```http
PUT /api/companies/:id
Headers: Authorization: Bearer <token>
```

**Request Body:** (Şirket oluştur ile aynı)

### Şirket Sil
```http
DELETE /api/companies/:id
Headers: Authorization: Bearer <token>
```

---

## 📦 Products API

### Ürünleri Listele
```http
GET /api/products
Query Parameters:
  - companyId: uuid
  - category: kategori adı
  - minPrice: minimum fiyat
  - maxPrice: maksimum fiyat
  - search: arama terimi
  - page: 1
  - limit: 20
```

**Response:**
```json
{
  "products": [
    {
      "id": "uuid",
      "companyId": "uuid",
      "name": "Ürün Adı",
      "description": "Ürün açıklaması",
      "category": "Kategori",
      "price": 1500.00,
      "currency": "TRY",
      "unit": "adet",
      "minOrderQuantity": 100,
      "stock": 1000,
      "isAvailable": true,
      "tags": ["etiket1", "etiket2"],
      "viewCount": 250,
      "images": [
        {
          "id": "uuid",
          "imageUrl": "url",
          "order": 0
        }
      ],
      "company": {
        "name": "Şirket Adı",
        "slug": "sirket-adi"
      }
    }
  ],
  "pagination": { ... }
}
```

### Ürün Detayı
```http
GET /api/products/:id
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Ürün Adı",
  "description": "Detaylı açıklama",
  "category": "Kategori",
  "price": 1500.00,
  "currency": "TRY",
  "unit": "adet",
  "minOrderQuantity": 100,
  "stock": 1000,
  "isAvailable": true,
  "specifications": {
    "renk": "Mavi",
    "ebat": "50x100cm"
  },
  "tags": ["etiket1"],
  "viewCount": 251,
  "images": [
    {
      "id": "uuid",
      "imageUrl": "url",
      "order": 0
    }
  ],
  "reviews": [
    {
      "id": "uuid",
      "userId": "uuid",
      "companyName": "Değerlendiren Şirket",
      "rating": 5,
      "comment": "Harika ürün",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "company": {
    "name": "Şirket Adı",
    "slug": "sirket-adi"
  }
}
```

### Ürün Oluştur
```http
POST /api/products
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Ürün Adı",
  "description": "Açıklama",
  "category": "Kategori",
  "price": 1500.00,
  "currency": "TRY",
  "unit": "adet",
  "minOrderQuantity": 100,
  "stock": 1000,
  "specifications": {
    "renk": "Mavi"
  },
  "tags": ["etiket1", "etiket2"]
}
```

### Ürün Güncelle
```http
PUT /api/products/:id
Headers: Authorization: Bearer <token>
```

### Ürün Sil
```http
DELETE /api/products/:id
Headers: Authorization: Bearer <token>
```

### Ürün Resmi Ekle
```http
POST /api/products/:id/images
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
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
}
```

### Ürünü Favorilere Ekle
```http
POST /api/products/:id/favorite
Headers: Authorization: Bearer <token>
```

### Ürüne Yorum Yap
```http
POST /api/products/:id/reviews
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Harika ürün, çok memnun kaldık"
}
```

---

## 🎥 Videos API

### Videoları Listele
```http
GET /api/videos
Query Parameters:
  - companyId: uuid
  - category: kategori
  - platform: YOUTUBE, VIMEO, OTHER
```

**Response:**
```json
{
  "videos": [
    {
      "id": "uuid",
      "companyId": "uuid",
      "title": "Video Başlığı",
      "description": "Video açıklaması",
      "url": "https://youtube.com/watch?v=...",
      "platform": "YOUTUBE",
      "embedId": "video_id",
      "thumbnailUrl": "url",
      "category": "Ürün Tanıtımı",
      "viewCount": 1200,
      "company": {
        "name": "Şirket Adı"
      }
    }
  ]
}
```

### Video Ekle
```http
POST /api/videos
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Video Başlığı",
  "description": "Açıklama",
  "url": "https://youtube.com/watch?v=abc123",
  "category": "Ürün Tanıtımı",
  "thumbnailUrl": "url (opsiyonel)"
}
```

### Video Sil
```http
DELETE /api/videos/:id
Headers: Authorization: Bearer <token>
```

---

## 🖼️ Gallery API

### Galeri Öğelerini Listele
```http
GET /api/gallery
Query Parameters:
  - companyId: uuid
  - type: IMAGE, VIDEO, DOCUMENT
  - category: kategori
```

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "companyId": "uuid",
      "title": "Başlık",
      "description": "Açıklama",
      "type": "IMAGE",
      "url": "https://example.com/image.jpg",
      "thumbnailUrl": "url",
      "category": "Ürünler",
      "order": 0,
      "viewCount": 45
    }
  ]
}
```

### Galeri Öğesi Ekle
```http
POST /api/gallery
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Başlık",
  "description": "Açıklama",
  "type": "IMAGE",
  "url": "https://example.com/image.jpg",
  "thumbnailUrl": "url",
  "category": "Ürünler",
  "order": 0
}
```

### Galeri Öğesi Sil
```http
DELETE /api/gallery/:id
Headers: Authorization: Bearer <token>
```

---

## ⭐ Reviews API

### Şirket Yorumlarını Listele
```http
GET /api/reviews
Query Parameters:
  - companyId: uuid (zorunlu)
  - minRating: 1-5
  - isPublished: true/false
```

**Response:**
```json
{
  "reviews": [
    {
      "id": "uuid",
      "companyId": "uuid",
      "reviewerName": "Ahmet Yılmaz",
      "reviewerCompany": "ABC Tekstil",
      "rating": 5,
      "title": "Mükemmel İş Ortağı",
      "comment": "Çok profesyonel ve zamanında teslim...",
      "communicationRating": 5,
      "qualityRating": 5,
      "timelinessRating": 5,
      "isVerified": true,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Şirket İstatistikleri
```http
GET /api/reviews/stats/:companyId
```

**Response:**
```json
{
  "totalReviews": 45,
  "averageRating": 4.6,
  "ratingDistribution": {
    "5": 30,
    "4": 10,
    "3": 3,
    "2": 1,
    "1": 1
  },
  "averageCommunicationRating": 4.7,
  "averageQualityRating": 4.8,
  "averageTimelinessRating": 4.5
}
```

### Yorum Ekle
```http
POST /api/reviews
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "companyId": "uuid",
  "rating": 5,
  "title": "Harika İş Ortağı",
  "comment": "Detaylı yorum...",
  "communicationRating": 5,
  "qualityRating": 5,
  "timelinessRating": 5
}
```

---

## 📝 Blog API

### Blog Yazılarını Listele
```http
GET /api/blog
Query Parameters:
  - companyId: uuid
  - tag: etiket
  - search: arama terimi
```

**Response:**
```json
{
  "posts": [
    {
      "id": "uuid",
      "companyId": "uuid",
      "title": "Blog Başlığı",
      "slug": "blog-basligi",
      "excerpt": "Kısa özet...",
      "coverImage": "url",
      "tags": ["etiket1", "etiket2"],
      "viewCount": 350,
      "isPublished": true,
      "publishedAt": "2025-01-01T00:00:00Z",
      "company": {
        "name": "Şirket Adı"
      }
    }
  ]
}
```

### Blog Yazısı Detayı
```http
GET /api/blog/:slug
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Blog Başlığı",
  "slug": "blog-basligi",
  "content": "Tam içerik markdown formatında...",
  "excerpt": "Özet",
  "coverImage": "url",
  "tags": ["etiket1"],
  "viewCount": 351,
  "isPublished": true,
  "publishedAt": "2025-01-01T00:00:00Z",
  "company": {
    "name": "Şirket Adı",
    "logo": "url"
  }
}
```

### Blog Yazısı Oluştur
```http
POST /api/blog
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Blog Başlığı",
  "content": "Markdown formatında içerik...",
  "excerpt": "Kısa özet",
  "coverImage": "url",
  "tags": ["etiket1", "etiket2"],
  "isPublished": true
}
```

### Blog Yazısı Güncelle
```http
PUT /api/blog/:id
Headers: Authorization: Bearer <token>
```

### Blog Yazısı Sil
```http
DELETE /api/blog/:id
Headers: Authorization: Bearer <token>
```

---

## 📊 Analytics API

### Dashboard İstatistikleri
```http
GET /api/analytics/dashboard
Headers: Authorization: Bearer <token>
```

**Response:**
```json
{
  "company": {
    "id": "uuid",
    "name": "Şirket Adı"
  },
  "stats": {
    "totalProducts": 45,
    "totalVideos": 12,
    "totalViews": 3500,
    "totalReviews": 28,
    "averageRating": 4.6
  },
  "pendingConnections": 5,
  "unreadMessages": 8,
  "recentProducts": [ ... ],
  "topSearches": [
    {
      "searchTerm": "tekstil",
      "count": 15
    }
  ]
}
```

### Popüler Aramalar
```http
GET /api/analytics/popular-searches
Query Parameters:
  - days: 7, 30, 90 (default: 30)
  - limit: 10 (default: 10)
```

**Response:**
```json
{
  "searches": [
    {
      "searchTerm": "tekstil",
      "count": 145,
      "trend": "up"
    }
  ]
}
```

### Trend Sektörler
```http
GET /api/analytics/trending-industries
Query Parameters:
  - days: 7, 30, 90
```

**Response:**
```json
{
  "industries": [
    {
      "industryType": "TEKSTIL",
      "searchCount": 234,
      "companyCount": 89
    }
  ]
}
```

### Platform Geneli İstatistikler
```http
GET /api/analytics/platform-stats
```

**Response:**
```json
{
  "totalCompanies": 1250,
  "activeCompanies": 1100,
  "totalProducts": 5600,
  "totalConnections": 3400,
  "totalViews": 125000,
  "popularIndustries": [
    {
      "industryType": "TEKSTIL",
      "count": 234
    }
  ],
  "topCities": [
    {
      "city": "İstanbul",
      "count": 450
    }
  ]
}
```

### Şirket Raporu
```http
GET /api/analytics/company-report/:companyId
Query Parameters:
  - period: week, month, year (default: month)
```

**Response:**
```json
{
  "company": {
    "name": "Şirket Adı"
  },
  "period": "month",
  "metrics": {
    "totalViews": 450,
    "newConnections": 12,
    "newProducts": 5,
    "newReviews": 8,
    "averageRating": 4.7
  },
  "engagement": {
    "profileVisits": 450,
    "productViews": 1200,
    "videoViews": 350,
    "engagementRate": 15.5
  },
  "topProducts": [ ... ],
  "recentReviews": [ ... ]
}
```

---

## 🔔 Notifications API

### Bildirimleri Listele
```http
GET /api/notifications
Headers: Authorization: Bearer <token>
Query Parameters:
  - page: 1
  - limit: 20
  - isRead: true/false
```

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "connection_request",
      "title": "Yeni Bağlantı İsteği",
      "message": "ABC Tekstil size bağlantı isteği gönderdi",
      "link": "/connections",
      "imageUrl": "url",
      "isRead": false,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

### Bildirimi Okundu İşaretle
```http
PUT /api/notifications/:id/read
Headers: Authorization: Bearer <token>
```

### Tüm Bildirimleri Okundu İşaretle
```http
PUT /api/notifications/mark-all-read
Headers: Authorization: Bearer <token>
```

### Bildirim Sil
```http
DELETE /api/notifications/:id
Headers: Authorization: Bearer <token>
```

---

## ❓ FAQ API

### SSS Listele
```http
GET /api/faq
Query Parameters:
  - companyId: uuid (zorunlu)
  - category: kategori
```

**Response:**
```json
{
  "faqs": [
    {
      "id": "uuid",
      "question": "Minimum sipariş miktarınız nedir?",
      "answer": "Minimum 100 adet sipariş alıyoruz...",
      "category": "Sipariş",
      "order": 1,
      "viewCount": 45
    }
  ]
}
```

### SSS Ekle
```http
POST /api/faq
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "question": "Soru?",
  "answer": "Cevap...",
  "category": "Kategori",
  "order": 1
}
```

### SSS Güncelle
```http
PUT /api/faq/:id
Headers: Authorization: Bearer <token>
```

### SSS Sil
```http
DELETE /api/faq/:id
Headers: Authorization: Bearer <token>
```

---

## 🤝 Connections API

### Bağlantı İsteklerini Listele
```http
GET /api/connections
Headers: Authorization: Bearer <token>
Query Parameters:
  - status: PENDING, ACCEPTED, REJECTED
  - type: sent, received
```

**Response:**
```json
{
  "connections": [
    {
      "id": "uuid",
      "fromCompany": {
        "id": "uuid",
        "name": "Gönderen Şirket",
        "logo": "url",
        "industryType": "TEKSTIL"
      },
      "toCompany": {
        "id": "uuid",
        "name": "Alan Şirket",
        "logo": "url",
        "industryType": "BASKI"
      },
      "status": "PENDING",
      "message": "İş ortaklığı kurmak isteriz",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### Bağlantı İsteği Gönder
```http
POST /api/connections
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "toCompanyId": "uuid",
  "message": "Merhaba, iş ortaklığı kurmak isteriz..."
}
```

### Bağlantı İsteğini Kabul Et
```http
PUT /api/connections/:id/accept
Headers: Authorization: Bearer <token>
```

### Bağlantı İsteğini Reddet
```http
PUT /api/connections/:id/reject
Headers: Authorization: Bearer <token>
```

---

## 💬 Messages API

### Mesajları Listele
```http
GET /api/messages
Headers: Authorization: Bearer <token>
Query Parameters:
  - type: sent, received
  - isRead: true/false
```

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "fromCompany": {
        "id": "uuid",
        "name": "Gönderen Şirket",
        "logo": "url"
      },
      "toCompany": {
        "id": "uuid",
        "name": "Alan Şirket",
        "logo": "url"
      },
      "subject": "Teklif Talebi",
      "content": "Merhaba, ürünleriniz hakkında teklif almak istiyoruz...",
      "isRead": false,
      "createdAt": "2025-01-15T14:30:00Z"
    }
  ]
}
```

### Mesaj Gönder
```http
POST /api/messages
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "toCompanyId": "uuid",
  "subject": "Teklif Talebi",
  "content": "Mesaj içeriği..."
}
```

### Mesajı Okundu İşaretle
```http
PUT /api/messages/:id/read
Headers: Authorization: Bearer <token>
```

### Mesaj Sil
```http
DELETE /api/messages/:id
Headers: Authorization: Bearer <token>
```

---

## 🔍 Search API

### Gelişmiş Arama
```http
GET /api/search
Query Parameters:
  - query: arama terimi
  - industries: TEKSTIL,BASKI (virgülle ayrılmış)
  - cities: İstanbul,Ankara
  - companySize: MICRO,SMALL,MEDIUM,LARGE
  - seekingPartners: true/false
  - page: 1
  - limit: 20
```

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "name": "Şirket Adı",
      "slug": "sirket-adi",
      "description": "Açıklama...",
      "logo": "url",
      "industryType": "TEKSTIL",
      "city": "İstanbul",
      "matchScore": 95,
      "matchReasons": [
        "Sektör uyumlu",
        "Aynı şehirde",
        "İş ortağı arıyor"
      ]
    }
  ],
  "pagination": { ... },
  "filters": {
    "industries": { "TEKSTIL": 45, "BASKI": 23 },
    "cities": { "İstanbul": 67, "Ankara": 34 }
  }
}
```

---

## 📌 Enums & Constants

### Industry Types
```
TEKSTIL, BASKI, PAZARLAMA, LOJISTIK, AMBALAJ, TASARIM, YAZILIM,
URETIM, GIDA, INSAAT, MOBILYA, OTOMOTIV, ELEKTRIK_ELEKTRONIK,
KIMYA, PLASTIK, METAL, KAGIT, DERI, CAM_SERAMIK, ENERJI,
TARIM, DANISMANLIK, EGITIM, SAGLIK, TURIZM, DIGER
```

### Company Sizes
```
MICRO (1-10 çalışan)
SMALL (11-50 çalışan)
MEDIUM (51-250 çalışan)
LARGE (250+ çalışan)
```

### Connection Status
```
PENDING
ACCEPTED
REJECTED
```

### Media Types
```
IMAGE
VIDEO
DOCUMENT
```

### Video Platforms
```
YOUTUBE
VIMEO
OTHER
```

---

## 🚨 Error Responses

Tüm hatalar aşağıdaki formatta döner:

```json
{
  "error": "Hata mesajı"
}
```

### HTTP Status Codes
- `200` - Başarılı
- `201` - Oluşturuldu
- `400` - Geçersiz istek
- `401` - Yetkilendirme gerekli
- `403` - Erişim engellendi
- `404` - Bulunamadı
- `500` - Sunucu hatası

---

## 💡 Notlar

1. **Sayfalama:** Tüm liste endpoint'leri sayfalama destekler
2. **Filtreleme:** Query parametreleri ile filtreleme yapılabilir
3. **Sıralama:** Çoğu endpoint `sortBy` ve `order` parametrelerini destekler
4. **Arama:** Full-text search desteği mevcuttur
5. **Rate Limiting:** API'de henüz rate limiting yoktur (production'da eklenecek)

---

**Son Güncelleme:** 2025-01-16
**API Version:** 1.0.0
