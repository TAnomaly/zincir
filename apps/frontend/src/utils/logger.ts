// Production'da window.location.hostname kontrolü yapıyoruz
const isDevelopment =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

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
}

export const logger = new Logger();
