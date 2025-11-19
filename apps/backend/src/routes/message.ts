import express, { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { socketService } from '../services/socket.js';

export const messageRouter = express.Router();

// Mesaj gönder
messageRouter.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { receiverId, subject, content } = req.body;

    const senderCompany = await prisma.company.findUnique({
      where: { userId: req.userId! },
    });

    if (!senderCompany) {
      throw new AppError('Önce şirket profili oluşturmalısınız', 400);
    }

    const receiverUser = await prisma.user.findUnique({
      where: { id: receiverId },
      include: { company: true },
    });

    if (!receiverUser || !receiverUser.company) {
      throw new AppError('Alıcı bulunamadı', 404);
    }

    const message = await prisma.message.create({
      data: {
        senderId: req.userId!,
        senderCompanyId: senderCompany.id,
        receiverId,
        receiverCompanyId: receiverUser.company.id,
        subject,
        content,
      },
      include: {
        senderCompany: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        receiverCompany: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    // Socket ile alıcıya bildir
    socketService.emitToUser(receiverId, 'new_message', {
      ...message,
      senderCompany: message.senderCompany,
    });

    res.status(201).json({
      message: 'Mesaj gönderildi',
      data: message,
    });
  } catch (error) {
    next(error);
  }
});

// Gelen mesajları getir
messageRouter.get('/inbox', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        receiverId: req.userId!,
      },
      include: {
        senderCompany: {
          select: {
            id: true,
            name: true,
            logo: true,
            industryType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(messages);
  } catch (error) {
    next(error);
  }
});

// Gönderilen mesajları getir
messageRouter.get('/sent', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        senderId: req.userId!,
      },
      include: {
        receiverCompany: {
          select: {
            id: true,
            name: true,
            logo: true,
            industryType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(messages);
  } catch (error) {
    next(error);
  }
});

// Mesajı okundu olarak işaretle
messageRouter.put('/:id/read', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const message = await prisma.message.findUnique({
      where: { id: req.params.id },
    });

    if (!message) {
      throw new AppError('Mesaj bulunamadı', 404);
    }

    if (message.receiverId !== req.userId) {
      throw new AppError('Bu işlem için yetkiniz yok', 403);
    }

    const updated = await prisma.message.update({
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

// Okunmamış mesaj sayısı
messageRouter.get('/unread-count', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const count = await prisma.message.count({
      where: {
        receiverId: req.userId!,
        isRead: false,
      },
    });

    res.json({ count });
  } catch (error) {
    next(error);
  }
});

// Konuşmaları getir (Son mesajlarla birlikte)
messageRouter.get('/conversations', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    // Kullanıcının dahil olduğu tüm mesajları getir (en yeniden eskiye)
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        senderCompany: {
          select: { id: true, name: true, logo: true, userId: true, slug: true },
        },
        receiverCompany: {
          select: { id: true, name: true, logo: true, userId: true, slug: true },
        },
      },
    });

    // Mesajları konuşmalara göre grupla
    const conversationsMap = new Map();

    for (const msg of messages) {
      const isSender = msg.senderId === userId;
      const otherUserId = isSender ? msg.receiverId : msg.senderId;
      const otherCompany = isSender ? msg.receiverCompany : msg.senderCompany;

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          otherUser: {
            id: otherUserId,
            companyId: otherCompany.id,
            name: otherCompany.name,
            logo: otherCompany.logo,
            slug: otherCompany.slug,
          },
          lastMessage: {
            content: msg.content,
            createdAt: msg.createdAt,
            isRead: msg.isRead,
            senderId: msg.senderId,
          },
          unreadCount: 0,
        });
      }

      // Okunmamış mesaj sayısını hesapla (eğer alıcı ben isem ve okunmamışsa)
      if (!isSender && !msg.isRead) {
        conversationsMap.get(otherUserId).unreadCount += 1;
      }
    }

    const conversations = Array.from(conversationsMap.values());

    res.json(conversations);
  } catch (error) {
    next(error);
  }
});

// Belirli bir kullanıcıyla olan mesaj geçmişini getir
messageRouter.get('/:userId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.userId!;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        senderCompany: {
          select: { id: true, name: true, logo: true }
        },
        receiverCompany: {
          select: { id: true, name: true, logo: true }
        }
      }
    });

    // Mesajları okundu olarak işaretle (eğer alıcı ben isem)
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: currentUserId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json(messages);
  } catch (error) {
    next(error);
  }
});
