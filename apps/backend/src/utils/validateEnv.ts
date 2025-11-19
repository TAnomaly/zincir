import { logger } from './logger.js';

export function validateEnv() {
  const requiredEnvVars = [
    'JWT_SECRET',
    'DATABASE_URL',
  ];

  const missingVars: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    logger.production(`❌ HATA: Eksik environment değişkenleri: ${missingVars.join(', ')}`);
    logger.production('Lütfen .env dosyanızı kontrol edin.');
    process.exit(1);
  }

  // JWT_SECRET güvenlik kontrolü
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    logger.production('⚠️  UYARI: JWT_SECRET production ortamında en az 32 karakter olmalıdır!');
    logger.production('Güvenlik riski bulunmaktadır. Lütfen daha güçlü bir secret kullanın.');
  }

  logger.log('✅ Environment değişkenleri doğrulandı');
}
