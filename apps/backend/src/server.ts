import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.js';
import { companyRouter } from './routes/company.js';
import { connectionRouter } from './routes/connection.js';
import { messageRouter } from './routes/message.js';
import { searchRouter } from './routes/search.js';
import { productRouter } from './routes/product.js';
import { videoRouter } from './routes/video.js';
import { galleryRouter } from './routes/gallery.js';
import { reviewRouter } from './routes/review.js';
import { blogRouter } from './routes/blog.js';
import { analyticsRouter } from './routes/analytics.js';
import { notificationRouter } from './routes/notification.js';
import { faqRouter } from './routes/faq.js';
import { needRouter } from './routes/need.js';
import { uploadRouter } from './routes/upload.js';
import path from 'path';
import { errorHandler } from './middleware/errorHandler.js';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow loading images from uploads
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.'
});

// Apply rate limiting to all requests
app.use(limiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use(express.urlencoded({ extended: true }));

import { adminRouter } from './routes/admin.js';

// Routes
app.use('/api/auth', authRouter);
app.use('/api/companies', companyRouter);
app.use('/api/connections', connectionRouter);
app.use('/api/messages', messageRouter);
app.use('/api/search', searchRouter);
app.use('/api/products', productRouter);
app.use('/api/video', videoRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/blog', blogRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/faq', faqRouter);
app.use('/api/needs', needRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/admin', adminRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

import { socketService } from './services/socket.js';

// Error handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Zincir API sunucusu ${PORT} portunda çalışıyor`);
    console.log(`📍 http://localhost:${PORT}`);
  });

  socketService.init(server);
}

export { app };
