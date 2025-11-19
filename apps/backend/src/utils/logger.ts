const isDevelopment = process.env.NODE_ENV !== 'production';

class Logger {
  log(...args: any[]) {
    if (isDevelopment) {
      console.log(...args);
    }
  }

  error(...args: any[]) {
    if (isDevelopment) {
      console.error(...args);
    }
  }

  warn(...args: any[]) {
    if (isDevelopment) {
      console.warn(...args);
    }
  }

  info(...args: any[]) {
    if (isDevelopment) {
      console.info(...args);
    }
  }

  // Production'da da önemli loglar için (sadece server başlatma, kritik hatalar)
  production(...args: any[]) {
    console.log(...args);
  }
}

export const logger = new Logger();
