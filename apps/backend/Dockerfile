# Backend Dockerfile
FROM node:20-alpine

# OpenSSL ve gerekli kütüphaneleri kur
RUN apk add --no-cache openssl libc6-compat

# Çalışma dizini
WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Prisma dosyalarını kopyala
COPY prisma ./prisma/

# Prisma client'ı oluştur
RUN npx prisma generate

# Tüm dosyaları kopyala
COPY . .

# Port
EXPOSE 3001

# Başlat
CMD ["npm", "run", "dev"]
