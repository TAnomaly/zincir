import express, { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const analyticsRouter = express.Router();

analyticsRouter.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { company: true }
    });

    if (!user?.company) {
      throw new AppError('Şirket profiliniz bulunamadı', 404);
    }

    const companyId = user.company.id;

    // Date ranges
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Parallel queries for efficiency
    const [
      totalViews,
      viewsLast7Days,
      viewsLast30Days,
      recentVisitors,
      productStats,
      needStats
    ] = await Promise.all([
      // Total Profile Views
      prisma.profileView.count({ where: { companyId } }),

      // Last 7 Days
      prisma.profileView.count({
        where: {
          companyId,
          viewedAt: { gte: sevenDaysAgo }
        }
      }),

      // Last 30 Days
      prisma.profileView.count({
        where: {
          companyId,
          viewedAt: { gte: thirtyDaysAgo }
        }
      }),

      // Recent Visitors (last 10 unique visitors if possible, or just last 20 records)
      prisma.profileView.findMany({
        where: { companyId, viewerId: { not: null } },
        orderBy: { viewedAt: 'desc' },
        take: 20,
        include: {
          viewer: {
            select: {
              id: true,
              email: true,
              company: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  logo: true,
                  city: true,
                  industryType: true
                }
              }
            }
          }
        }
      }),

      // Product Stats
      prisma.product.aggregate({
        where: { companyId },
        _sum: { viewCount: true },
        _count: { id: true }
      }),

      // Need Stats
      prisma.need.aggregate({
        where: { companyId },
        _sum: { viewCount: true },
        _count: { id: true }
      })
    ]);

    // Process recent visitors to remove duplicates if needed, or just send raw list
    // For MVP, raw list is fine, frontend can deduplicate or show "User X viewed 5 times"

    res.json({
      profile: {
        totalViews,
        viewsLast7Days,
        viewsLast30Days,
      },
      products: {
        totalProducts: productStats._count.id,
        totalViews: productStats._sum.viewCount || 0,
      },
      needs: {
        totalNeeds: needStats._count.id,
        totalViews: needStats._sum.viewCount || 0,
      },
      recentVisitors: recentVisitors.map(v => ({
        viewedAt: v.viewedAt,
        visitor: v.viewer?.company ? {
          type: 'COMPANY',
          ...v.viewer.company
        } : {
          type: 'USER',
          email: v.viewer?.email
        }
      }))
    });

  } catch (error) {
    next(error);
  }
});
