import express, { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, optionalAuthenticate, AuthRequest } from '../middleware/auth.js';

export const needRouter = express.Router();

// Get all needs (with filters)
needRouter.get('/', optionalAuthenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { industryType, status, companyId, limit = '12', page = '1', search, filter } = req.query;

        const where: any = {};

        // Status filter
        if (status && status !== 'ALL') {
            where.status = status as string;
        } else if (!status) {
            if (!companyId && filter !== 'connections') {
                where.status = 'ACTIVE';
            }
        }

        if (industryType && industryType !== 'ALL') {
            where.industryType = industryType;
        }

        if (companyId) {
            where.companyId = companyId as string;
        }

        if (filter === 'connections' && req.userId) {
            const user = await prisma.user.findUnique({
                where: { id: req.userId },
                include: { company: true }
            });

            if (user?.company) {
                const userCompanyId = user.company.id;
                const connections = await prisma.connection.findMany({
                    where: {
                        OR: [
                            { requesterId: userCompanyId, status: 'ACCEPTED' },
                            { receiverId: userCompanyId, status: 'ACCEPTED' }
                        ]
                    }
                });

                const connectedCompanyIds = connections.map(c =>
                    c.requesterId === userCompanyId ? c.receiverId : c.requesterId
                );

                where.companyId = { in: connectedCompanyIds };
            }
        }

        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        console.log('Needs Search Query:', req.query);
        console.log('Needs Where Clause:', JSON.stringify(where, null, 2));

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const [needs, total] = await Promise.all([
            prisma.need.findMany({
                where,
                include: {
                    company: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            logo: true,
                            city: true,
                            isPremium: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: parseInt(limit as string),
                skip,
            }),
            prisma.need.count({ where }),
        ]);

        res.json({
            needs,
            pagination: {
                total,
                page: parseInt(page as string),
                pages: Math.ceil(total / parseInt(limit as string)),
            },
        });
    } catch (error) {
        next(error);
    }
});

// Create a need
needRouter.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, description, industryType, quantity, budget, deadline } = req.body;
        const userId = (req as any).userId;

        const company = await prisma.company.findUnique({
            where: { userId },
        });

        if (!company) {
            return res.status(400).json({ error: 'Şirket profili oluşturmalısınız.' });
        }

        const need = await prisma.need.create({
            data: {
                companyId: company.id,
                title,
                description,
                industryType,
                quantity,
                budget,
                deadline: deadline ? new Date(deadline) : null,
            },
        });

        // Find matching companies
        // 1. Same industry
        // 2. Not the creator company
        // 3. Active companies
        const matches = await prisma.company.findMany({
            where: {
                industryType: industryType,
                id: { not: company.id },
                isActive: true,
                // Optional: Add text search if needed
                // OR: [
                //   { description: { contains: title, mode: 'insensitive' } },
                //   { services: { some: { title: { contains: title, mode: 'insensitive' } } } }
                // ]
            },
            take: 10,
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                city: true,
                industryType: true,
                description: true,
            }
        });

        res.status(201).json({
            need,
            matches
        });
    } catch (error) {
        next(error);
    }
});

// Get matching companies for a need
needRouter.get('/:id/matches', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const need = await prisma.need.findUnique({
            where: { id },
        });

        if (!need) {
            return res.status(404).json({ error: 'İlan bulunamadı' });
        }

        const matches = await prisma.company.findMany({
            where: {
                industryType: need.industryType,
                id: { not: need.companyId },
                isActive: true,
            },
            take: 20,
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                city: true,
                industryType: true,
                description: true,
            }
        });

        res.json(matches);
    } catch (error) {
        next(error);
    }
});

// Get single need
needRouter.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const need = await prisma.need.findUnique({
            where: { id },
            include: {
                company: true,
            },
        });

        if (!need) {
            return res.status(404).json({ error: 'İlan bulunamadı' });
        }

        // Increment view count
        await prisma.need.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });

        res.json(need);
    } catch (error) {
        next(error);
    }
});
