#!/bin/bash

# Zincir - Docker Kurulum ve Başlatma Scripti

echo "🔗 Zincir Platform - Docker Kurulumu"
echo "======================================"
echo ""

# Docker daemon'u başlat
echo "🐳 Docker daemon başlatılıyor..."
sudo systemctl start docker
sudo systemctl enable docker

# Docker socket izinlerini düzelt
echo "🔧 Docker socket izinleri ayarlanıyor..."
sudo chmod 666 /var/run/docker.sock

# Kullanıcıyı docker grubuna ekle (zaten eklenmişse skip)
echo "👤 Kullanıcı docker grubuna ekleniyor..."
sudo usermod -aG docker $USER

echo ""
echo "✅ Docker hazır!"
echo ""

# Docker compose ile başlat
echo "🚀 Platform başlatılıyor..."
echo ""

docker-compose up -d --build

echo ""
echo "⏳ Container'lar başlatılıyor..."
sleep 15

echo ""
echo "📊 Container durumları:"
docker-compose ps

echo ""
echo "======================================"
echo "🎉 Platform Hazır!"
echo "======================================"
echo ""
echo "🌐 Frontend:  http://localhost:3000"
echo "🔌 Backend:   http://localhost:3001"
echo "🗄️  Database:  localhost:5432"
echo ""
echo "📊 Logları görmek için:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Durdurmak için:"
echo "   docker-compose down"
echo ""
