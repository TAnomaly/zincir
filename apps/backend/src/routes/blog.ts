import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const blogRouter = express.Router();

function createSlug(title: string): string {
  const trMap: { [key: string]: string } = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  };
  return title.split('').map(char => trMap[char] || char).join('')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// Blog yazılarını listele
blogRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId, tag, page = '1', limit = '10' } = req.query;

    const where: any = { isPublished: true };
    if (companyId) where.companyId = companyId;
    if (tag) where.tags = { has: tag };

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
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
        },
        orderBy: { publishedAt: 'desc' },
      }),
      prisma.blogPost.count({ where }),
    ]);

    res.json({
      posts,
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

// Blog yazısı detayı
blogRouter.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.blogPost.findFirst({
      where: { slug: req.params.slug, isPublished: true },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
    });

    if (!post) {
      throw new AppError('Yazı bulunamadı', 404);
    }

    // Görüntülenme sayısını artır
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    res.json(post);
  } catch (error) {
    next(error);
  }
});

// Blog yazısı oluştur
blogRouter.post(
  '/',
  authenticate,
  [
    body('title').notEmpty().withMessage('Başlık gereklidir'),
    body('content').notEmpty().withMessage('İçerik gereklidir'),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const company = await prisma.company.findUnique({
        where: { userId: req.userId! },
      });

      if (!company) {
        throw new AppError('Önce şirket profili oluşturmalısınız', 400);
      }

      const slug = createSlug(req.body.title);

      const post = await prisma.blogPost.create({
        data: {
          companyId: company.id,
          title: req.body.title,
          slug,
          content: req.body.content,
          excerpt: req.body.excerpt,
          coverImage: req.body.coverImage,
          tags: req.body.tags || [],
          isPublished: req.body.isPublished || false,
          publishedAt: req.body.isPublished ? new Date() : null,
        },
      });

      res.status(201).json({
        message: 'Blog yazısı oluşturuldu',
        post,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Blog yazısı güncelle
blogRouter.put('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: req.params.id },
      include: { company: true },
    });

    if (!post) {
      throw new AppError('Yazı bulunamadı', 404);
    }

    if (post.company.userId !== req.userId) {
      throw new AppError('Bu işlem için yetkiniz yok', 403);
    }

    const updated = await prisma.blogPost.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        publishedAt: req.body.isPublished && !post.publishedAt ? new Date() : post.publishedAt,
      },
    });

    res.json({
      message: 'Blog yazısı güncellendi',
      post: updated,
    });
  } catch (error) {
    next(error);
  }
});

// Blog yazısı sil
blogRouter.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: req.params.id },
      include: { company: true },
    });

    if (!post) {
      throw new AppError('Yazı bulunamadı', 404);
    }

    if (post.company.userId !== req.userId) {
      throw new AppError('Bu işlem için yetkiniz yok', 403);
    }

    await prisma.blogPost.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Blog yazısı silindi' });
  } catch (error) {
    next(error);
  }
});
