# Zincir Platform - Makefile
.PHONY: help build up down logs clean restart dev prod

help: ## Bu yardım mesajını gösterir
	@echo "Zincir Platform - Docker Komutları"
	@echo ""
	@echo "Kullanım: make [komut]"
	@echo ""
	@echo "Komutlar:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Docker imajlarını oluştur
	docker-compose build

up: ## Tüm servisleri başlat
	docker-compose up -d
	@echo ""
	@echo "✅ Zincir platformu başlatıldı!"
	@echo "🌐 Frontend: http://localhost:3000"
	@echo "🔌 Backend:  http://localhost:3001"
	@echo "🗄️  Database: localhost:5432"
	@echo ""
	@echo "Logları görmek için: make logs"

down: ## Tüm servisleri durdur
	docker-compose down

logs: ## Tüm servislerin loglarını göster
	docker-compose logs -f

logs-backend: ## Backend loglarını göster
	docker-compose logs -f backend

logs-frontend: ## Frontend loglarını göster
	docker-compose logs -f frontend

logs-db: ## Database loglarını göster
	docker-compose logs -f postgres

clean: ## Tüm container'ları, volume'leri ve imajları sil
	docker-compose down -v --rmi all
	@echo "✅ Tüm Docker kaynakları temizlendi"

restart: ## Servisleri yeniden başlat
	docker-compose restart

dev: ## Development modunda başlat (build + up)
	@make build
	@make up

prod: ## Production için build et
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

shell-backend: ## Backend container'a shell aç
	docker-compose exec backend sh

shell-frontend: ## Frontend container'a shell aç
	docker-compose exec frontend sh

shell-db: ## PostgreSQL container'a bağlan
	docker-compose exec postgres psql -U zincir_user -d zincir_db

migrate: ## Prisma migration'larını çalıştır
	docker-compose exec backend npx prisma migrate dev

migrate-deploy: ## Production migration
	docker-compose exec backend npx prisma migrate deploy

seed: ## Veritabanına örnek veri ekle
	docker-compose exec backend npx prisma db seed

status: ## Container durumlarını göster
	docker-compose ps

prune: ## Kullanılmayan Docker kaynaklarını temizle
	docker system prune -af
	docker volume prune -f
	@echo "✅ Docker sistem temizlendi"
