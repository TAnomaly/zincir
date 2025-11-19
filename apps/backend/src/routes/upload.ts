import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const uploadRouter = express.Router();

// Upload dizini
const uploadDir = path.join(process.cwd(), 'uploads');
fs.ensureDirSync(uploadDir);

// Multer yapılandırması
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Sadece resim ve video dosyaları yüklenebilir!'));
        }
    },
});

// Dosya yükleme endpoint'i
uploadRouter.post('/', authenticate, upload.single('file'), (req: AuthRequest, res, next) => {
    try {
        if (!req.file) {
            throw new AppError('Dosya yüklenemedi', 400);
        }

        // URL oluştur (localhost veya production domain)
        const baseUrl = process.env.API_URL || 'http://localhost:3001';
        const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

        res.status(201).json({
            url: fileUrl,
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
        });
    } catch (error) {
        next(error);
    }
});

export { uploadRouter };
