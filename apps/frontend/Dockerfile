# Frontend Dockerfile
FROM node:20-alpine

# Çalışma dizini
WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install --legacy-peer-deps

# Tüm dosyaları kopyala
COPY . .

# Port
EXPOSE 3000

# Başlat
CMD ["npm", "run", "dev", "--", "--host"]
