import express, { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const galleryRouter = express.Router();

// Galeri öğelerini listele
galleryRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId, type, category } = req.query;

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (type) where.type = type;
    if (category) where.category = category;

    const items = await prisma.mediaGallery.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    res.json(items);
  } catch (error) {
    next(error);
  }
});

// Galeri öğesi ekle
galleryRouter.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const company = await prisma.company.findUnique({
      where: { userId: req.userId! },
    });

    if (!company) {
      throw new AppError('Önce şirket profili oluşturmalısınız', 400);
    }

    const item = await prisma.mediaGallery.create({
      data: {
        companyId: company.id,
        title: req.body.title,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        type: req.body.type || 'image',
        category: req.body.category,
        tags: req.body.tags || [],
        order: req.body.order || 0,
      },
    });

    // Stats güncelle
    await prisma.companyStats.upsert({
      where: { companyId: company.id },
      create: {
        companyId: company.id,
        totalGalleryItems: 1,
      },
      update: {
        totalGalleryItems: { increment: 1 },
      },
    });

    res.status(201).json({
      message: 'Galeri öğesi eklendi',
      item,
    });
  } catch (error) {
    next(error);
  }
});

// Galeri öğesi sil
galleryRouter.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.mediaGallery.findUnique({
      where: { id: req.params.id },
      include: { company: true },
    });

    if (!item) {
      throw new AppError('Öğe bulunamadı', 404);
    }

    if (item.company.userId !== req.userId) {
      throw new AppError('Bu işlem için yetkiniz yok', 403);
    }

    await prisma.mediaGallery.delete({
      where: { id: req.params.id },
    });

    await prisma.companyStats.update({
      where: { companyId: item.companyId },
      data: { totalGalleryItems: { decrement: 1 } },
    });

    res.json({ message: 'Galeri öğesi silindi' });
  } catch (error) {
    next(error);
  }
});
