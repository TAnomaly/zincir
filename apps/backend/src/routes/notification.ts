import express from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const notificationRouter = express.Router();

// Kullanıcının bildirimlerini getir
notificationRouter.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20', unreadOnly = 'false' } = req.query;

    const where: any = { userId: req.userId! };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: req.userId!, isRead: false },
      }),
    ]);

    res.json({
      notifications,
      unreadCount,
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

// Bildirimi okundu olarak işaretle
notificationRouter.put('/:id/read', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id },
    });

    if (!notification || notification.userId !== req.userId) {
      return res.status(404).json({ error: 'Bildirim bulunamadı' });
    }

    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Tüm bildirimleri okundu olarak işaretle
notificationRouter.put('/mark-all-read', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.userId!,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json({ message: 'Tüm bildirimler okundu olarak işaretlendi' });
  } catch (error) {
    next(error);
  }
});

// Bildirim sil
notificationRouter.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id },
    });

    if (!notification || notification.userId !== req.userId) {
      return res.status(404).json({ error: 'Bildirim bulunamadı' });
    }

    await prisma.notification.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Bildirim silindi' });
  } catch (error) {
    next(error);
  }
});

// Bildirim oluştur (helper function - internal use)
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string,
  imageUrl?: string
) {
  return await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
      imageUrl,
    },
  });
}
