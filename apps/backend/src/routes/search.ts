import express, { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

export const searchRouter = express.Router();

// Gelişmiş arama ve eşleştirme
searchRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      query,
      industryType,
      city,
      companySize,
      hasCapability,
      page = '1',
      limit = '12',
      seekingPartners,
    } = req.query;

    const where: any = { isActive: true };

    // Sektör filtresi
    if (industryType) {
      where.industryType = industryType;
    }

    // Şehir filtresi
    if (city) {
      where.city = city;
    }

    // Firma büyüklüğü
    if (companySize) {
      where.companySize = companySize;
    }

    // Yetenek filtresi
    if (hasCapability) {
      where.capabilities = {
        some: {
          name: {
            contains: hasCapability as string,
            mode: 'insensitive',
          },
        },
      };
    }

    if (seekingPartners !== undefined) {
      where.seekingPartners = seekingPartners === 'true';
    }

    // Genel arama
    if (query) {
      where.OR = [
        { name: { contains: query as string, mode: 'insensitive' } },
        { description: { contains: query as string, mode: 'insensitive' } },
        {
          services: {
            some: {
              OR: [
                { title: { contains: query as string, mode: 'insensitive' } },
                { description: { contains: query as string, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        include: {
          services: {
            take: 3,
          },
          capabilities: {
            take: 5,
          },
          _count: {
            select: {
              connections: true,
              portfolio: true,
            },
          },
        },
        orderBy: [
          { isPremium: 'desc' },
          { connectionCount: 'desc' },
          { viewCount: 'desc' },
        ],
      }),
      prisma.company.count({ where }),
    ]);

    // Arama logla
    if (query) {
      await prisma.searchLog.create({
        data: {
          query: query as string,
          filters: {
            industryType,
            city,
            companySize,
            hasCapability,
            seekingPartners,
          },
          resultCount: total,
        },
      });
    }

    res.json({
      companies,
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

// Önerilen şirketler (eşleştirme algoritması)
searchRouter.get('/recommendations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'companyId gerekli' });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId as string },
      include: {
        capabilities: true,
        services: true,
      },
    });

    if (!company) {
      return res.status(404).json({ error: 'Şirket bulunamadı' });
    }

    // Eşleştirme algoritması
    // 1. Aynı sektörden şirketler
    // 2. Aynı şehirden şirketler
    // 3. Tamamlayıcı hizmetlere sahip şirketler

    const recommendations = await prisma.company.findMany({
      where: {
        AND: [
          { id: { not: company.id } },
          { isActive: true },
          {
            OR: [
              { industryType: company.industryType },
              { city: company.city },
              {
                services: {
                  some: {
                    category: {
                      in: company.services.map(s => s.category),
                    },
                  },
                },
              },
            ],
          },
        ],
      },
      take: 10,
      include: {
        services: {
          take: 3,
        },
        capabilities: {
          take: 5,
        },
        _count: {
          select: {
            connections: true,
          },
        },
      },
      orderBy: [
        { isPremium: 'desc' },
        { connectionCount: 'desc' },
      ],
    });

    res.json(recommendations);
  } catch (error) {
    next(error);
  }
});

// Popüler aramalar
searchRouter.get('/popular', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const popularSearches = await prisma.searchLog.groupBy({
      by: ['query'],
      _count: {
        query: true,
      },
      orderBy: {
        _count: {
          query: 'desc',
        },
      },
      take: 10,
    });

    res.json(popularSearches);
  } catch (error) {
    next(error);
  }
});
