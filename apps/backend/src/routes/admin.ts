import express, { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

export const adminRouter = express.Router();

// Admin yetkisi kontrolü
adminRouter.use(authenticate, authorize('ADMIN'));

// Sistem İstatistikleri
adminRouter.get('/stats', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const [
            totalUsers,
            totalCompanies,
            totalProducts,
            totalMessages,
            activeCompanies,
            pendingCompanies
        ] = await Promise.all([
            prisma.user.count(),
            prisma.company.count(),
            prisma.product.count(),
            prisma.message.count(),
            prisma.company.count({ where: { isActive: true } }),
            prisma.company.count({ where: { isActive: false } })
        ]);

        res.json({
            totalUsers,
            totalCompanies,
            totalProducts,
            totalMessages,
            activeCompanies,
            pendingCompanies
        });
    } catch (error) {
        next(error);
    }
});

// Kullanıcıları Listele
adminRouter.get('/users', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50 // Sayfalama eklenebilir
        });

        res.json(users);
    } catch (error) {
        next(error);
    }
});

// Şirketleri Listele
adminRouter.get('/companies', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const companies = await prisma.company.findMany({
            include: {
                user: {
                    select: {
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        res.json(companies);
    } catch (error) {
        next(error);
    }
});

// Şirket Durumunu Güncelle (Onayla/Reddet/Pasife Al)
adminRouter.put('/companies/:id/status', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { isActive } = req.body;

        const company = await prisma.company.update({
            where: { id: req.params.id },
            data: { isActive }
        });

        res.json(company);
    } catch (error) {
        next(error);
    }
});
