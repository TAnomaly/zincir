import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const companyRouter = express.Router();

// Şirket slug oluştur
function createSlug(name: string): string {
  const trMap: { [key: string]: string } = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  };

  return name
    .split('')
    .map(char => trMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Şirket oluştur
companyRouter.post(
  '/',
  authenticate,
  [
    body('name').notEmpty().withMessage('Şirket adı gereklidir'),
    body('description').notEmpty().withMessage('Açıklama gereklidir'),
    body('phone').notEmpty().withMessage('Telefon gereklidir'),
    body('email').isEmail().withMessage('Geçerli bir email giriniz'),
    body('city').notEmpty().withMessage('Şehir gereklidir'),
    body('address').notEmpty().withMessage('Adres gereklidir'),
    body('industryType').notEmpty().withMessage('Sektör seçiniz'),
    body('companySize').notEmpty().withMessage('Firma büyüklüğü seçiniz'),
    body('seekingPartners').optional().isBoolean().withMessage('Geçerli bir değer gönderiniz'),
    body('partnerCriteria').optional().isString().isLength({ max: 2000 }).withMessage('Kriter açıklaması çok uzun'),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const existingCompany = await prisma.company.findUnique({
        where: { userId: req.userId! },
      });

      if (existingCompany) {
        throw new AppError('Zaten bir şirket profiliniz var', 400);
      }

      const slug = createSlug(req.body.name);

      const company = await prisma.company.create({
        data: {
          userId: req.userId!,
          name: req.body.name,
          slug,
          description: req.body.description,
          phone: req.body.phone,
          email: req.body.email,
          website: req.body.website,
          address: req.body.address,
          city: req.body.city,
          district: req.body.district,
          industryType: req.body.industryType,
          companySize: req.body.companySize,
          foundedYear: req.body.foundedYear,
          logo: req.body.logo,
          coverImage: req.body.coverImage,
          seekingPartners: req.body.seekingPartners ?? false,
          partnerCriteria: req.body.partnerCriteria,
        },
      });

      res.status(201).json({
        message: 'Şirket profili oluşturuldu',
        company,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Tüm şirketleri listele
companyRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      industryType,
      city,
      companySize,
      search,
      page = '1',
      limit = '12',
      seekingPartners
    } = req.query;

    const where: any = { isActive: true };

    if (industryType) where.industryType = industryType;
    if (city) where.city = city;
    if (companySize) where.companySize = companySize;
    if (seekingPartners !== undefined) {
      where.seekingPartners = seekingPartners === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        include: {
          services: true,
          capabilities: true,
          _count: {
            select: {
              connections: true,
              portfolio: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.company.count({ where }),
    ]);

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

// Şirket detayı
companyRouter.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await prisma.company.findUnique({
      where: { slug: req.params.slug },
      include: {
        services: true,
        capabilities: true,
        certifications: true,
        portfolio: true,
        user: {
          select: {
            email: true,
            createdAt: true,
          },
        },
      },
    });

    if (!company) {
      throw new AppError('Şirket bulunamadı', 404);
    }

    // Görüntüleme sayısını artır
    await prisma.company.update({
      where: { id: company.id },
      data: { viewCount: { increment: 1 } },
    });

    res.json(company);
  } catch (error) {
    next(error);
  }
});

// Şirket güncelle
companyRouter.put(
  '/:id',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const company = await prisma.company.findUnique({
        where: { id: req.params.id },
      });

      if (!company) {
        throw new AppError('Şirket bulunamadı', 404);
      }

      if (company.userId !== req.userId) {
        throw new AppError('Bu işlem için yetkiniz yok', 403);
      }

      const updated = await prisma.company.update({
        where: { id: req.params.id },
        data: req.body,
      });

      res.json({
        message: 'Şirket güncellendi',
        company: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Hizmet ekle
companyRouter.post(
  '/:id/services',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const company = await prisma.company.findUnique({
        where: { id: req.params.id },
      });

      if (!company || company.userId !== req.userId) {
        throw new AppError('Yetkisiz işlem', 403);
      }

      const service = await prisma.service.create({
        data: {
          companyId: req.params.id,
          title: req.body.title,
          description: req.body.description,
          category: req.body.category,
        },
      });

      res.status(201).json(service);
    } catch (error) {
      next(error);
    }
  }
);

// Yetenek ekle
companyRouter.post(
  '/:id/capabilities',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const company = await prisma.company.findUnique({
        where: { id: req.params.id },
      });

      if (!company || company.userId !== req.userId) {
        throw new AppError('Yetkisiz işlem', 403);
      }

      const capability = await prisma.capability.create({
        data: {
          companyId: req.params.id,
          name: req.body.name,
          level: req.body.level,
          yearsExp: req.body.yearsExp,
        },
      });

      res.status(201).json(capability);
    } catch (error) {
      next(error);
    }
  }
);
