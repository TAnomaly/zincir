import express from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const faqRouter = express.Router();

// SSS listele
faqRouter.get('/', async (req, res, next) => {
  try {
    const { companyId, category } = req.query;

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (category) where.category = category;

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    res.json(faqs);
  } catch (error) {
    next(error);
  }
});

// SSS ekle
faqRouter.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { userId: req.userId! },
    });

    if (!company) {
      throw new AppError('Önce şirket profili oluşturmalısınız', 400);
    }

    const faq = await prisma.fAQ.create({
      data: {
        companyId: company.id,
        question: req.body.question,
        answer: req.body.answer,
        category: req.body.category,
        order: req.body.order || 0,
      },
    });

    res.status(201).json({
      message: 'SSS eklendi',
      faq,
    });
  } catch (error) {
    next(error);
  }
});

// SSS güncelle
faqRouter.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const faq = await prisma.fAQ.findUnique({
      where: { id: req.params.id },
      include: { company: true },
    });

    if (!faq || faq.company.userId !== req.userId) {
      throw new AppError('Yetkisiz işlem', 403);
    }

    const updated = await prisma.fAQ.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({
      message: 'SSS güncellendi',
      faq: updated,
    });
  } catch (error) {
    next(error);
  }
});

// SSS sil
faqRouter.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const faq = await prisma.fAQ.findUnique({
      where: { id: req.params.id },
      include: { company: true },
    });

    if (!faq || faq.company.userId !== req.userId) {
      throw new AppError('Yetkisiz işlem', 403);
    }

    await prisma.fAQ.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'SSS silindi' });
  } catch (error) {
    next(error);
  }
});
