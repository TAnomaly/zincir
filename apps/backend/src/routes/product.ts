import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const productRouter = express.Router();

// Slug oluştur
function createSlug(name: string): string {
  const trMap: { [key: string]: string } = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  };
  return name.split('').map(char => trMap[char] || char).join('')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// Tüm ürünleri listele (public)
productRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      companyId,
      category,
      search,
      minPrice,
      maxPrice,
      page = '1',
      limit = '20',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const where: any = { isAvailable: true };

    if (companyId) where.companyId = companyId;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              slug: true,
            },
          },
          images: {
            orderBy: { order: 'asc' },
            take: 5,
          },
          videos: {
            orderBy: { order: 'asc' },
            take: 1,
          },
          _count: {
            select: { favorites: true, reviews: true },
          },
        },
        orderBy: { [sortBy as string]: sortOrder },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
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

// Ürün detayı (public)
productRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            city: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
        videos: {
          orderBy: { order: 'asc' },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { favorites: true, reviews: true },
        },
      },
    });

    if (!product) {
      throw new AppError('Ürün bulunamadı', 404);
    }

    // Görüntülenme sayısını artır
    await prisma.product.update({
      where: { id: req.params.id },
      data: { viewCount: { increment: 1 } },
    });

    res.json(product);
  } catch (error) {
    next(error);
  }
});

// Ürün oluştur (authenticated)
productRouter.post(
  '/',
  authenticate,
  [
    body('name').notEmpty().withMessage('Ürün adı gereklidir'),
    body('description').notEmpty().withMessage('Açıklama gereklidir'),
    body('category').notEmpty().withMessage('Kategori gereklidir'),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Kullanıcının şirketini bul
      const company = await prisma.company.findUnique({
        where: { userId: req.userId! },
      });

      if (!company) {
        throw new AppError('Önce şirket profili oluşturmalısınız', 400);
      }

      const slug = createSlug(req.body.name);

      const product = await prisma.product.create({
        data: {
          companyId: company.id,
          name: req.body.name,
          slug,
          description: req.body.description,
          price: req.body.price,
          currency: req.body.currency || 'TRY',
          category: req.body.category,
          subcategory: req.body.subcategory,
          tags: req.body.tags || [],
          stock: req.body.stock,
          sku: req.body.sku,
          mainImage: req.body.mainImage,
          specifications: req.body.specifications,
          isAvailable: req.body.isAvailable !== false,
          images: req.body.images && Array.isArray(req.body.images) ? {
            create: req.body.images.map((url: string, index: number) => ({
              url,
              order: index,
            }))
          } : undefined,
          videos: req.body.videos && Array.isArray(req.body.videos) ? {
            create: req.body.videos.map((url: string, index: number) => ({
              url,
              order: index,
            }))
          } : undefined,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          images: true,
          videos: true,
        },
      });

      // Stats güncelle
      await prisma.companyStats.upsert({
        where: { companyId: company.id },
        create: {
          companyId: company.id,
          totalProducts: 1,
        },
        update: {
          totalProducts: { increment: 1 },
        },
      });

      res.status(201).json({
        message: 'Ürün oluşturuldu',
        product,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Ürün güncelle
productRouter.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { company: true },
    });

    if (!product) {
      throw new AppError('Ürün bulunamadı', 404);
    }

    if (product.company.userId !== req.userId) {
      throw new AppError('Bu işlem için yetkiniz yok', 403);
    }

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    res.json({
      message: 'Ürün güncellendi',
      product: updated,
    });
  } catch (error) {
    next(error);
  }
});

// Ürün sil
productRouter.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { company: true },
    });

    if (!product) {
      throw new AppError('Ürün bulunamadı', 404);
    }

    if (product.company.userId !== req.userId) {
      throw new AppError('Bu işlem için yetkiniz yok', 403);
    }

    await prisma.product.delete({
      where: { id: req.params.id },
    });

    // Stats güncelle
    await prisma.companyStats.update({
      where: { companyId: product.companyId },
      data: { totalProducts: { decrement: 1 } },
    });

    res.json({ message: 'Ürün silindi' });
  } catch (error) {
    next(error);
  }
});

// Ürün görseli ekle
productRouter.post('/:id/images', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { company: true },
    });

    if (!product || product.company.userId !== req.userId) {
      throw new AppError('Yetkisiz işlem', 403);
    }

    const image = await prisma.productImage.create({
      data: {
        productId: req.params.id,
        url: req.body.url,
        alt: req.body.alt,
        order: req.body.order || 0,
      },
    });

    res.status(201).json(image);
  } catch (error) {
    next(error);
  }
});

// Ürünü favorilere ekle
productRouter.post('/:id/favorite', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const existing = await prisma.productFavorite.findUnique({
      where: {
        userId_productId: {
          userId: req.userId!,
          productId: req.params.id,
        },
      },
    });

    if (existing) {
      throw new AppError('Ürün zaten favorilerde', 400);
    }

    await prisma.productFavorite.create({
      data: {
        userId: req.userId!,
        productId: req.params.id,
      },
    });

    await prisma.product.update({
      where: { id: req.params.id },
      data: { favoriteCount: { increment: 1 } },
    });

    res.json({ message: 'Favorilere eklendi' });
  } catch (error) {
    next(error);
  }
});

// Ürün değerlendirmesi ekle
productRouter.post('/:id/reviews', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { userId: req.userId! },
    });

    if (!company) {
      throw new AppError('Şirket profili gerekli', 400);
    }

    const review = await prisma.productReview.create({
      data: {
        productId: req.params.id,
        userId: req.userId!,
        companyName: company.name,
        rating: req.body.rating,
        comment: req.body.comment,
      },
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
});
