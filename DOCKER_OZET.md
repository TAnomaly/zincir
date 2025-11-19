# 🐳 Docker ile Zincir - Hızlı Özet

## ⚡ Tek Komut Kurulum

### Yöntem 1: Otomatik Script (En Kolay)
```bash
./start.sh
```

### Yöntem 2: Make ile (Önerilen)
```bash
make dev
```

### Yöntem 3: Docker Compose ile
```bash
docker-compose up -d --build
```

### Yöntem 4: NPM ile
```bash
npm run docker:dev
```

## 🌐 Erişim

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432

## 📝 Temel Komutlar

| Komut | Açıklama |
|-------|----------|
| `make dev` | Platformu başlat |
| `make logs` | Logları göster |
| `make down` | Durdur |
| `make clean` | Tümünü temizle |
| `make restart` | Yeniden başlat |
| `make status` | Durum kontrolü |
| `make shell-backend` | Backend shell |
| `make shell-db` | Database shell |

## 🎯 İlk Kullanım

1. **Platformu Başlat**
   ```bash
   make dev
   ```

2. **Tarayıcıda Aç**
   - http://localhost:3000

3. **Kayıt Ol**
   - Email: test@example.com
   - Şifre: 123456

4. **Şirket Profili Oluştur**
   - İşletme bilgilerinizi girin
   - Hizmetlerinizi ekleyin

5. **İş Ortağı Ara**
   - Sektöre göre filtreleyin
   - Bağlantı isteği gönderin

## 🔧 Sorun Giderme

### Container başlamıyor?
```bash
make logs  # Hata mesajlarını incele
```

### Database bağlantı hatası?
```bash
make restart  # Yeniden başlat
```

### Her şey bozuldu?
```bash
make clean  # Tümünü temizle
make dev    # Yeniden başlat
```

## 📊 İçeride Neler Var?

Docker otomatik olarak:

✅ **PostgreSQL 15** kurulur
- Database: `zincir_db`
- User: `zincir_user`
- Password: `zincir_password`

✅ **Backend (Node.js + Express + TypeScript)** başlatılır
- Port: 3001
- Auto migration
- Hot reload

✅ **Frontend (React + Vite + Tailwind)** başlatılır
- Port: 3000
- Hot reload
- Modern UI

## 🎨 Özellikler

✨ **Kullanıcı Sistemi**
- Kayıt ve giriş
- JWT authentication
- Şifre güvenliği

✨ **Şirket Profilleri**
- Detaylı bilgiler
- Logo ve kapak
- Hizmetler ve yetenekler
- Sertifikalar
- Portföy

✨ **Bağlantı Yönetimi**
- İstek gönder/al
- Kabul/reddet
- Bağlantı listesi

✨ **Mesajlaşma**
- Şirketler arası mesaj
- Gelen/giden kutusu
- Okundu işaretleme

✨ **Gelişmiş Arama**
- Sektör filtresi
- Şehir filtresi
- Metin arama
- Akıllı eşleştirme

## 🚀 Production'a Geçiş

```bash
make prod
```

Production modunda:
- Optimized build
- Nginx ile frontend
- Production environment
- Güvenlik ayarları

## 📚 Dokümantasyon

- **Hızlı Başlangıç**: [QUICKSTART.md](QUICKSTART.md)
- **Docker Detayları**: [DOCKER.md](DOCKER.md)
- **Genel Bilgi**: [README.md](README.md)

## 🆘 Yardım

Tüm make komutlarını görmek için:
```bash
make help
```

Docker durumunu kontrol etmek için:
```bash
make status
```

---

**Kolay gelsin!** 🎉

İyi çalışmalar! 🇹🇷
