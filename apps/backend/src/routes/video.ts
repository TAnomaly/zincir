import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const videoRouter = express.Router();

// Tüm videoları listele
videoRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      companyId,
      platform,
      category,
      search,
      page = '1',
      limit = '12'
    } = req.query;

    const where: any = {};

    if (companyId) where.companyId = companyId;
    if (platform) where.platform = platform;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.video.count({ where }),
    ]);

    res.json({
      videos,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Video detayı
videoRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: req.params.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
    });

    if (!video) {
      throw new AppError('Video bulunamadı', 404);
    }

    // Görüntülenme sayısını artır
    await prisma.video.update({
      where: { id: req.params.id },
      data: { viewCount: { increment: 1 } },
    });

    res.json(video);
  } catch (error) {
    next(error);
  }
});

// Video ekle
videoRouter.post(
  '/',
  authenticate,
  [
    body('title').notEmpty().withMessage('Başlık gereklidir'),
    body('videoUrl').notEmpty().withMessage('Video URL gereklidir'),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const company = await prisma.company.findUnique({
        where: { userId: req.userId! },
      });

      if (!company) {
        throw new AppError('Önce şirket profili oluşturmalısınız', 400);
      }

      const video = await prisma.video.create({
        data: {
          companyId: company.id,
          title: req.body.title,
          description: req.body.description,
          videoUrl: req.body.videoUrl,
          thumbnailUrl: req.body.thumbnailUrl,
          platform: req.body.platform || 'youtube',
          category: req.body.category,
          tags: req.body.tags || [],
          duration: req.body.duration,
        },
      });

      // Stats güncelle
      await prisma.companyStats.upsert({
        where: { companyId: company.id },
        create: {
          companyId: company.id,
          totalVideos: 1,
        },
        update: {
          totalVideos: { increment: 1 },
        },
      });

      res.status(201).json({
        message: 'Video eklendi',
        video,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Video güncelle
videoRouter.put('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: req.params.id },
      include: { company: true },
    });

    if (!video) {
      throw new AppError('Video bulunamadı', 404);
    }

    if (video.company.userId !== req.userId) {
      throw new AppError('Bu işlem için yetkiniz yok', 403);
    }

    const updated = await prisma.video.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({
      message: 'Video güncellendi',
      video: updated,
    });
  } catch (error) {
    next(error);
  }
});

// Video sil
videoRouter.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: req.params.id },
      include: { company: true },
    });

    if (!video) {
      throw new AppError('Video bulunamadı', 404);
    }

    if (video.company.userId !== req.userId) {
      throw new AppError('Bu işlem için yetkiniz yok', 403);
    }

    await prisma.video.delete({
      where: { id: req.params.id },
    });

    // Stats güncelle
    await prisma.companyStats.update({
      where: { companyId: video.companyId },
      data: { totalVideos: { decrement: 1 } },
    });

    res.json({ message: 'Video silindi' });
  } catch (error) {
    next(error);
  }
});
