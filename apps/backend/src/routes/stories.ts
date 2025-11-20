import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// --- Multer Configuration for Stories ---
const uploadDir = path.join(process.cwd(), 'uploads', 'stories');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create a folder for today's date: uploads/stories/2024-11-20
        const date = new Date();
        const dateFolder = date.toISOString().split('T')[0];
        const targetDir = path.join(uploadDir, dateFolder);

        fs.ensureDirSync(targetDir);
        cb(null, targetDir);
    },
    filename: (req: any, file, cb) => {
        const userId = req.userId || 'anonymous';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit for videos
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Sadece resim ve video dosyaları yüklenebilir!'));
        }
    },
});

// --- Routes ---

// Get all active stories (grouped by company)
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
    try {
        // 24 saat öncesi
        const now = new Date();

        const stories = await prisma.story.findMany({
            where: {
                expiresAt: {
                    gt: now
                },
                company: {
                    isBanned: false,
                    isActive: true
                }
            },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Group by company
        const groupedStories = stories.reduce((acc: any, story) => {
            const companyId = story.companyId;
            if (!acc[companyId]) {
                acc[companyId] = {
                    company: story.company,
                    stories: []
                };
            }
            acc[companyId].stories.push(story);
            return acc;
        }, {});

        res.json(Object.values(groupedStories));
    } catch (error) {
        next(error);
    }
});

// Create a new story
router.post('/', authenticate, (req: AuthRequest, res, next) => {
    const uploadSingle = upload.single('file');

    uploadSingle(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'Dosya boyutu çok büyük (Max 50MB)' });
            }
            return res.status(400).json({ message: err.message });
        } else if (err) {
            // An unknown error occurred when uploading.
            return res.status(400).json({ message: err.message });
        }

        // Everything went fine.
        try {
            console.log('Story upload started for user:', req.userId);

            if (!req.file) {
                console.error('No file uploaded');
                throw new AppError('Dosya yüklenemedi', 400);
            }
            console.log('File uploaded:', req.file);

            const user = await prisma.user.findUnique({
                where: { id: req.userId },
                include: { company: true }
            });

            let companyId = user?.company?.id;

            if (!companyId) {
                if (user?.role === 'ADMIN') {
                    // If admin has no company, try to find the first available company
                    const firstCompany = await prisma.company.findFirst();
                    if (firstCompany) {
                        companyId = firstCompany.id;
                        console.log('Admin using fallback company:', companyId);
                    }
                }

                if (!companyId) {
                    console.error('User has no company:', req.userId);
                    // Delete uploaded file if no company
                    try {
                        if (req.file && fs.existsSync(req.file.path)) {
                            fs.unlinkSync(req.file.path);
                        }
                    } catch (unlinkError) {
                        console.error('Error deleting file:', unlinkError);
                    }
                    throw new AppError('Hikaye paylaşmak için bir şirketiniz olmalı', 403);
                }
            }

            // Construct File URL
            const dateFolder = new Date().toISOString().split('T')[0];
            const baseUrl = process.env.API_URL || 'http://localhost:3001';
            // Ensure we use forward slashes for URL
            const fileUrl = `${baseUrl}/uploads/stories/${dateFolder}/${req.file.filename}`;
            console.log('File URL constructed:', fileUrl);

            const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

            const story = await prisma.story.create({
                data: {
                    companyId: companyId,
                    mediaUrl: fileUrl,
                    mediaType: mediaType,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
                    caption: req.body.caption
                }
            });
            console.log('Story created in DB:', story.id);

            res.status(201).json(story);
        } catch (error) {
            console.error('Error in story creation:', error);
            next(error);
        }
    });
});

// Delete a story
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const story = await prisma.story.findUnique({
            where: { id: req.params.id },
            include: { company: true }
        });

        if (!story) {
            throw new AppError('Hikaye bulunamadı', 404);
        }

        // Check ownership
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: { company: true }
        });

        if (user?.company?.id !== story.companyId && user?.role !== 'ADMIN') {
            throw new AppError('Bu işlem için yetkiniz yok', 403);
        }

        await prisma.story.delete({
            where: { id: req.params.id }
        });

        // Optionally delete the file from disk (good practice)
        // Extract relative path from URL or store path in DB
        // For now, we skip file deletion to avoid complexity with URL parsing

        res.json({ message: 'Hikaye silindi' });
    } catch (error) {
        next(error);
    }
});

export default router;
