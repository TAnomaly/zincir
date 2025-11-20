import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

interface JwtPayload {
  userId: string;
  email: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Admin authentication middleware
 * Checks if user is authenticated AND has ADMIN role
 */
export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Yetkilendirme başlığı bulunamadı' });
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error('JWT_SECRET tanımlı değil');
      return res.status(500).json({ message: 'Sunucu yapılandırma hatası' });
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isBanned: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: 'Hesabınız yasaklanmış' });
    }

    // Check if user has ADMIN role
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Bu işlem için admin yetkisi gerekli' });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Geçersiz token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token süresi dolmuş' });
    }
    console.error('Admin auth middleware error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
};
