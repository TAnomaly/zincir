import express, { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export const needRouter = express.Router();

// Get all needs (with filters)
needRouter.get('/', async (req, res, next) => {
    try {
        const { industryType, status, limit = '20', page = '1' } = req.query;

        const where: any = {
            status: status ? (status as string) : 'ACTIVE',
        };

        if (industryType) {
            where.industryType = industryType;
        }

        const { search } = req.query;
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
