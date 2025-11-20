import express from 'express';
import { prisma } from '../lib/prisma.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// All routes require admin authentication
router.use(adminAuth);

/**
 * GET /api/admin/stats
 * Get platform statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalCompanies, totalProducts, totalNeeds, totalConnections, totalMessages] = await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.product.count(),
      prisma.need.count(),
      prisma.connection.count(),
      prisma.message.count(),
    ]);

    const bannedUsers = await prisma.user.count({ where: { isBanned: true } });
    const bannedCompanies = await prisma.company.count({ where: { isBanned: true } });
    const premiumCompanies = await prisma.company.count({ where: { isPremium: true } });

    res.json({
      totalUsers,
      totalCompanies,
      totalProducts,
      totalNeeds,
      totalConnections,
      totalMessages,
      bannedUsers,
      bannedCompanies,
      premiumCompanies,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'İstatistikler yüklenemedi' });
  }
});

/**
 * GET /api/admin/users
 * Get all users with pagination
 */
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const banned = req.query.banned as string;

    const where: any = {};

    if (search) {
      where.email = { contains: search, mode: 'insensitive' };
    }

    if (banned === 'true') {
      where.isBanned = true;
    } else if (banned === 'false') {
      where.isBanned = false;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          isBanned: true,
          bannedReason: true,
          bannedAt: true,
          createdAt: true,
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              isPremium: true,
              isBanned: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Kullanıcılar yüklenemedi' });
  }
});

/**
 * GET /api/admin/companies
 * Get all companies with pagination
 */
router.get('/companies', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const banned = req.query.banned as string;
    const premium = req.query.premium as string;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (banned === 'true') {
      where.isBanned = true;
    } else if (banned === 'false') {
      where.isBanned = false;
    }

    if (premium === 'true') {
      where.isPremium = true;
    } else if (premium === 'false') {
      where.isPremium = false;
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          email: true,
          phone: true,
          city: true,
          industryType: true,
          isPremium: true,
          premiumUntil: true,
          isBanned: true,
          bannedReason: true,
          bannedAt: true,
          isActive: true,
          viewCount: true,
          connectionCount: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.company.count({ where }),
    ]);

    res.json({
      companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin get companies error:', error);
    res.status(500).json({ message: 'Şirketler yüklenemedi' });
  }
});

/**
 * POST /api/admin/users/:userId/ban
 * Ban a user
 */
router.post('/users/:userId/ban', async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: 'Yasaklama nedeni gerekli' });
    }

    // Prevent banning yourself
    if (userId === req.user!.id) {
      return res.status(400).json({ message: 'Kendinizi yasaklayamazsınız' });
    }

    // Check if user exists and is not already banned
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isBanned: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Prevent banning other admins
    if (user.role === 'ADMIN') {
      return res.status(400).json({ message: 'Admin kullanıcıları yasaklayamazsınız' });
    }

    if (user.isBanned) {
      return res.status(400).json({ message: 'Kullanıcı zaten yasaklanmış' });
    }

    // Ban the user
    await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        bannedReason: reason,
        bannedAt: new Date(),
        bannedBy: req.user!.id,
      },
    });

    res.json({ message: 'Kullanıcı başarıyla yasaklandı' });
  } catch (error) {
    console.error('Admin ban user error:', error);
    res.status(500).json({ message: 'Kullanıcı yasaklanamadı' });
  }
});

/**
 * POST /api/admin/users/:userId/unban
 * Unban a user
 */
router.post('/users/:userId/unban', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isBanned: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    if (!user.isBanned) {
      return res.status(400).json({ message: 'Kullanıcı yasaklı değil' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        bannedReason: null,
        bannedAt: null,
        bannedBy: null,
      },
    });

    res.json({ message: 'Kullanıcı yasağı kaldırıldı' });
  } catch (error) {
    console.error('Admin unban user error:', error);
    res.status(500).json({ message: 'Kullanıcı yasağı kaldırılamadı' });
  }
});

/**
 * POST /api/admin/companies/:companyId/ban
 * Ban a company
 */
router.post('/companies/:companyId/ban', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: 'Yasaklama nedeni gerekli' });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, isBanned: true, userId: true },
    });

    if (!company) {
      return res.status(404).json({ message: 'Şirket bulunamadı' });
    }

    if (company.isBanned) {
      return res.status(400).json({ message: 'Şirket zaten yasaklanmış' });
    }

    await prisma.company.update({
      where: { id: companyId },
      data: {
        isBanned: true,
        bannedReason: reason,
        bannedAt: new Date(),
      },
    });

    res.json({ message: 'Şirket başarıyla yasaklandı' });
  } catch (error) {
    console.error('Admin ban company error:', error);
    res.status(500).json({ message: 'Şirket yasaklanamadı' });
  }
});

/**
 * POST /api/admin/companies/:companyId/unban
 * Unban a company
 */
router.post('/companies/:companyId/unban', async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, isBanned: true },
    });

    if (!company) {
      return res.status(404).json({ message: 'Şirket bulunamadı' });
    }

    if (!company.isBanned) {
      return res.status(400).json({ message: 'Şirket yasaklı değil' });
    }

    await prisma.company.update({
      where: { id: companyId },
      data: {
        isBanned: false,
        bannedReason: null,
        bannedAt: null,
      },
    });

    res.json({ message: 'Şirket yasağı kaldırıldı' });
  } catch (error) {
    console.error('Admin unban company error:', error);
    res.status(500).json({ message: 'Şirket yasağı kaldırılamadı' });
  }
});

/**
 * DELETE /api/admin/users/:userId
 * Delete a user permanently
 */
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent deleting yourself
    if (userId === req.user!.id) {
      return res.status(400).json({ message: 'Kendinizi silemezsiniz' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Prevent deleting other admins
    if (user.role === 'ADMIN') {
      return res.status(400).json({ message: 'Admin kullanıcıları silemezsiniz' });
    }

    // Cascade delete will handle company and related data
    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: 'Kullanıcı kalıcı olarak silindi' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: 'Kullanıcı silinemedi' });
  }
});

/**
 * DELETE /api/admin/companies/:companyId
 * Delete a company permanently
 */
router.delete('/companies/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      return res.status(404).json({ message: 'Şirket bulunamadı' });
    }

    await prisma.company.delete({
      where: { id: companyId },
    });

    res.json({ message: 'Şirket kalıcı olarak silindi' });
  } catch (error) {
    console.error('Admin delete company error:', error);
    res.status(500).json({ message: 'Şirket silinemedi' });
  }
});

/**
 * PUT /api/admin/companies/:companyId/premium
 * Set company premium status
 */
router.put('/companies/:companyId/premium', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { isPremium, premiumUntil } = req.body;

    if (typeof isPremium !== 'boolean') {
      return res.status(400).json({ message: 'isPremium boolean olmalı' });
    }

    const data: any = { isPremium };

    if (isPremium && premiumUntil) {
      data.premiumUntil = new Date(premiumUntil);
    } else if (!isPremium) {
      data.premiumUntil = null;
    }

    await prisma.company.update({
      where: { id: companyId },
      data,
    });

    res.json({ message: 'Premium durumu güncellendi' });
  } catch (error) {
    console.error('Admin set premium error:', error);
    res.status(500).json({ message: 'Premium durumu güncellenemedi' });
  }
});

/**
 * PUT /api/admin/users/:userId/role
 * Change user role
 */
router.put('/users/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Geçersiz rol' });
    }

    // Prevent changing your own role
    if (userId === req.user!.id) {
      return res.status(400).json({ message: 'Kendi rolünüzü değiştiremezsiniz' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    res.json({ message: 'Kullanıcı rolü güncellendi' });
  } catch (error) {
    console.error('Admin change role error:', error);
    res.status(500).json({ message: 'Rol değiştirilemedi' });
  }
});

/**
 * DELETE /api/admin/products/:productId
 * Delete a product
 */
router.delete('/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    await prisma.product.delete({
      where: { id: productId },
    });

    res.json({ message: 'Ürün silindi' });
  } catch (error) {
    console.error('Admin delete product error:', error);
    res.status(500).json({ message: 'Ürün silinemedi' });
  }
});

/**
 * DELETE /api/admin/needs/:needId
 * Delete a need
 */
router.delete('/needs/:needId', async (req, res) => {
  try {
    const { needId } = req.params;

    await prisma.need.delete({
      where: { id: needId },
    });

    res.json({ message: 'İlan silindi' });
  } catch (error) {
    console.error('Admin delete need error:', error);
    res.status(500).json({ message: 'İlan silinemedi' });
  }
});

export default router;
