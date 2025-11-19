import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const authRouter = express.Router();

// Kayıt
authRouter.post(
  '/register',
  [
    body('email').isEmail().withMessage('Geçerli bir email giriniz'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Şifre en az 6 karakter olmalıdır'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new AppError('Bu email zaten kullanımda', 400);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Kayıt başarılı',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

authRouter.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
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
      },
    });

    if (!user) {
      throw new AppError('Kullanıcı bulunamadı', 404);
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      hasCompany: !!user.company,
      companyId: user.company?.id,
      company: user.company,
    });
  } catch (error) {
    next(error);
  }
});

// Giriş
authRouter.post(
  '/login',
  [
    body('email').isEmail().withMessage('Geçerli bir email giriniz'),
    body('password').notEmpty().withMessage('Şifre gereklidir'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
        include: { company: true },
      });

      if (!user) {
        throw new AppError('Email veya şifre hatalı', 401);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new AppError('Email veya şifre hatalı', 401);
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Giriş başarılı',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          hasCompany: !!user.company,
          companyId: user.company?.id,
          company: user.company
            ? {
              id: user.company.id,
              name: user.company.name,
              slug: user.company.slug,
            }
            : undefined,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);


