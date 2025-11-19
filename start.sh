#!/bin/bash

# Zincir Platform - Otomatik Başlatma Scripti
# Bu script platformu otomatik olarak başlatır

set -e

echo "🔗 Zincir Platform Başlatılıyor..."
echo ""

# Docker kontrolü
if ! command -v docker &> /dev/null; then
    echo "❌ Docker bulunamadı!"
    echo "Docker'ı yüklemek için: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose bulunamadı!"
    echo "Docker Compose'u yüklemek için: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker kurulu"
echo ""

# Eski container'ları temizle (varsa)
echo "🧹 Eski container'lar temizleniyor..."
docker-compose down 2>/dev/null || true
echo ""

# Build ve başlat
echo "🏗️  Docker imajları oluşturuluyor..."
docker-compose build
echo ""

echo "🚀 Servisler başlatılıyor..."
docker-compose up -d
echo ""

# Servislerin başlamasını bekle
echo "⏳ Servisler hazırlanıyor..."
sleep 10

# Health check
echo "🔍 Servisler kontrol ediliyor..."
echo ""

# Backend health check
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Backend hazır: http://localhost:3001"
else
    echo "⚠️  Backend henüz hazır değil, birkaç saniye daha bekleyin..."
fi

# Frontend check
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend hazır: http://localhost:3000"
else
    echo "⚠️  Frontend henüz hazır değil, birkaç saniye daha bekleyin..."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Zincir Platform Başarıyla Başlatıldı!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
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
echo "❓ Yardım için:"
echo "   make help"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
