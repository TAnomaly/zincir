import express from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const connectionRouter = express.Router();

// Bağlantı isteği gönder
connectionRouter.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { receiverId, message } = req.body;

    const requesterCompany = await prisma.company.findUnique({
      where: { userId: req.userId! },
    });

    if (!requesterCompany) {
      throw new AppError('Önce şirket profili oluşturmalısınız', 400);
    }

    const receiverCompany = await prisma.company.findUnique({
      where: { id: receiverId },
    });

    if (!receiverCompany) {
      throw new AppError('Hedef şirket bulunamadı', 404);
    }

    if (requesterCompany.id === receiverId) {
      throw new AppError('Kendi şirketinize bağlantı isteği gönderemezsiniz', 400);
    }

    // Zaten bağlantı var mı kontrol et
    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: requesterCompany.id, receiverId },
          { requesterId: receiverId, receiverId: requesterCompany.id },
        ],
      },
    });

    if (existing) {
      throw new AppError('Bu şirketle zaten bir bağlantı var', 400);
    }

    const connection = await prisma.connection.create({
      data: {
        requesterId: requesterCompany.id,
        receiverId,
        message,
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            logo: true,
            industryType: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            logo: true,
            industryType: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Bağlantı isteği gönderildi',
      connection,
    });
  } catch (error) {
    next(error);
  }
});

// Bağlantı isteklerini getir
connectionRouter.get('/received', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { userId: req.userId! },
    });

    if (!company) {
      throw new AppError('Şirket profili bulunamadı', 404);
    }

    const connections = await prisma.connection.findMany({
      where: {
        receiverId: company.id,
        status: 'PENDING',
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            logo: true,
            industryType: true,
            city: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(connections);
  } catch (error) {
    next(error);
  }
});

// Gönderilen istekleri getir
connectionRouter.get('/sent', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { userId: req.userId! },
    });

    if (!company) {
      throw new AppError('Şirket profili bulunamadı', 404);
    }

    const connections = await prisma.connection.findMany({
      where: {
        requesterId: company.id,
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            logo: true,
            industryType: true,
            city: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(connections);
  } catch (error) {
    next(error);
  }
});

// Kabul edilmiş bağlantıları getir
connectionRouter.get('/accepted', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { userId: req.userId! },
    });

    if (!company) {
      throw new AppError('Şirket profili bulunamadı', 404);
    }

    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { requesterId: company.id },
          { receiverId: company.id },
        ],
        status: 'ACCEPTED',
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            logo: true,
            industryType: true,
            city: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            logo: true,
            industryType: true,
            city: true,
          },
        },
      },
      orderBy: {
        respondedAt: 'desc',
      },
    });

    res.json(connections);
  } catch (error) {
    next(error);
  }
});

// Bağlantı isteğini kabul et
connectionRouter.put('/:id/accept', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { userId: req.userId! },
    });

    if (!company) {
      throw new AppError('Şirket profili bulunamadı', 404);
    }

    const connection = await prisma.connection.findUnique({
      where: { id: req.params.id },
    });

    if (!connection) {
      throw new AppError('Bağlantı bulunamadı', 404);
    }

    if (connection.receiverId !== company.id) {
      throw new AppError('Bu işlem için yetkiniz yok', 403);
    }

    const updated = await prisma.connection.update({
      where: { id: req.params.id },
      data: {
        status: 'ACCEPTED',
        respondedAt: new Date(),
      },
      include: {
        requester: true,
        receiver: true,
      },
    });

    // İki şirketin de bağlantı sayısını artır
    await prisma.company.updateMany({
      where: {
        id: {
          in: [connection.requesterId, connection.receiverId],
        },
      },
      data: {
        connectionCount: {
          increment: 1,
        },
      },
    });

    res.json({
      message: 'Bağlantı kabul edildi',
      connection: updated,
    });
  } catch (error) {
    next(error);
  }
});

// Bağlantı isteğini reddet
connectionRouter.put('/:id/reject', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { userId: req.userId! },
    });

    if (!company) {
      throw new AppError('Şirket profili bulunamadı', 404);
    }

    const connection = await prisma.connection.findUnique({
      where: { id: req.params.id },
    });

    if (!connection) {
      throw new AppError('Bağlantı bulunamadı', 404);
    }

    if (connection.receiverId !== company.id) {
      throw new AppError('Bu işlem için yetkiniz yok', 403);
    }

    const updated = await prisma.connection.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED',
        respondedAt: new Date(),
      },
    });

    res.json({
      message: 'Bağlantı reddedildi',
      connection: updated,
    });
  } catch (error) {
    next(error);
  }
});
