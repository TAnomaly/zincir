import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const reviewRouter = express.Router();

// Şirket yorumlarını listele
reviewRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId, minRating, page = '1', limit = '10' } = req.query;

    const where: any = { isPublished: true };
    if (companyId) where.companyId = companyId;
    if (minRating) where.rating = { gte: parseInt(minRating as string) };

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where }),
    ]);

    res.json({
      reviews,
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

// Yorum ekle
reviewRouter.post(
  '/',
  authenticate,
  [
    body('companyId').notEmpty().withMessage('Şirket ID gereklidir'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Puan 1-5 arası olmalıdır'),
    body('comment').notEmpty().withMessage('Yorum gereklidir'),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const reviewerCompany = await prisma.company.findUnique({
        where: { userId: req.userId! },
      });

      if (!reviewerCompany) {
        throw new AppError('Yorum yapmak için şirket profili gereklidir', 400);
      }

      const review = await prisma.review.create({
        data: {
          companyId: req.body.companyId,
          reviewerUserId: req.userId!,
          reviewerName: reviewerCompany.name,
          reviewerCompany: reviewerCompany.name,
          rating: req.body.rating,
          title: req.body.title,
          comment: req.body.comment,
          communicationRating: req.body.communicationRating,
          qualityRating: req.body.qualityRating,
          timelinessRating: req.body.timelinessRating,
        },
      });

      // Ortalama puanı güncelle
      const avgResult = await prisma.review.aggregate({
        where: { companyId: req.body.companyId, isPublished: true },
        _avg: { rating: true },
        _count: true,
      });

      await prisma.companyStats.upsert({
        where: { companyId: req.body.companyId },
        create: {
          companyId: req.body.companyId,
          avgRating: avgResult._avg.rating || 0,
          totalReviews: avgResult._count,
        },
        update: {
          avgRating: avgResult._avg.rating || 0,
          totalReviews: avgResult._count,
        },
      });

      res.status(201).json({
        message: 'Yorum eklendi',
        review,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Şirketin ortalama puanını getir
reviewRouter.get('/stats/:companyId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await prisma.review.aggregate({
      where: {
        companyId: req.params.companyId,
        isPublished: true,
      },
      _avg: {
        rating: true,
        communicationRating: true,
        qualityRating: true,
        timelinessRating: true,
      },
      _count: true,
    });

    // Rating dağılımı
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        companyId: req.params.companyId,
        isPublished: true,
      },
      _count: true,
    });

    res.json({
      averageRating: result._avg.rating || 0,
      totalReviews: result._count,
      communicationAvg: result._avg.communicationRating || 0,
      qualityAvg: result._avg.qualityRating || 0,
      timelinessAvg: result._avg.timelinessRating || 0,
      ratingDistribution,
    });
  } catch (error) {
    next(error);
  }
});
