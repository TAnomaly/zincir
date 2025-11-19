import express from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const analyticsRouter = express.Router();

// Şirket dashboard istatistikleri
analyticsRouter.get('/dashboard', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { userId: req.userId! },
    });

    if (!company) {
      throw new AppError('Şirket profili bulunamadı', 404);
    }

    // İstatistikleri getir veya oluştur
    const stats = await prisma.companyStats.upsert({
      where: { companyId: company.id },
      create: { companyId: company.id },
      update: {},
    });

    // Ek veriler
    const [
      pendingConnections,
      unreadMessages,
      recentProducts,
      recentViews,
      topSearches
    ] = await Promise.all([
      prisma.connection.count({
        where: {
          receiverId: company.id,
          status: 'PENDING',
        },
      }),
      prisma.message.count({
        where: {
          receiverId: req.userId!,
          isRead: false,
        },
      }),
      prisma.product.findMany({
        where: { companyId: company.id },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          viewCount: true,
          favoriteCount: true,
        },
      }),
      prisma.searchLog.count({
        where: {
          query: {
            contains: company.name,
            mode: 'insensitive',
          },
        },
      }),
      prisma.searchLog.groupBy({
        by: ['query'],
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Son 30 gün
          },
        },
        _count: true,
        orderBy: {
          _count: {
            query: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    res.json({
      stats,
      pendingConnections,
      unreadMessages,
      recentProducts,
      recentViews,
      topSearches,
    });
  } catch (error) {
    next(error);
  }
});

// Popüler aramalar (public)
analyticsRouter.get('/popular-searches', async (req, res, next) => {
  try {
    const { days = '30', limit = '20' } = req.query;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days as string));

    const searches = await prisma.searchLog.groupBy({
      by: ['query'],
      where: {
        createdAt: { gte: daysAgo },
      },
      _count: {
        query: true,
      },
      _sum: {
        resultCount: true,
      },
      orderBy: {
        _count: {
          query: 'desc',
        },
      },
      take: parseInt(limit as string),
    });

    res.json(searches);
  } catch (error) {
    next(error);
  }
});

// Trend sektörler
analyticsRouter.get('/trending-industries', async (req, res, next) => {
  try {
    const { days = '7' } = req.query;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days as string));

    const trending = await prisma.company.groupBy({
      by: ['industryType'],
      where: {
        createdAt: { gte: daysAgo },
        isActive: true,
      },
      _count: true,
      orderBy: {
        _count: {
          industryType: 'desc',
        },
      },
    });

    res.json(trending);
  } catch (error) {
    next(error);
  }
});

// Platform geneli istatistikler (public)
analyticsRouter.get('/platform-stats', async (req, res, next) => {
  try {
    const [
      totalCompanies,
      totalProducts,
      totalConnections,
      activeCompanies,
      totalViews,
    ] = await Promise.all([
      prisma.company.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isAvailable: true } }),
      prisma.connection.count({ where: { status: 'ACCEPTED' } }),
      prisma.company.count({
        where: {
          isActive: true,
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.companyStats.aggregate({
        _sum: { totalViews: true },
      }),
    ]);

    res.json({
      totalCompanies,
      totalProducts,
      totalConnections,
      activeCompanies,
      totalViews: totalViews._sum.totalViews || 0,
    });
  } catch (error) {
    next(error);
  }
});

// Şirket performans raporu
analyticsRouter.get('/company-report/:companyId', async (req, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.companyId },
      include: {
        stats: true,
        _count: {
          select: {
            products: true,
            videos: true,
            blogPosts: true,
            reviews: true,
            connections: true,
          },
        },
      },
    });

    if (!company) {
      throw new AppError('Şirket bulunamadı', 404);
    }

    // Son 7 günün görüntülenmeleri
    const recentViews = company.stats?.weeklyViews || 0;

    // Ortalama puan
    const avgRating = company.stats?.avgRating || 0;

    res.json({
      company: {
        id: company.id,
        name: company.name,
        logo: company.logo,
      },
      counts: company._count,
      stats: company.stats,
      performance: {
        recentViews,
        avgRating,
        engagementRate: company.stats ?
          (company.stats.totalConnections / (company.stats.totalViews || 1)) * 100 : 0,
      },
    });
  } catch (error) {
    next(error);
  }
});
