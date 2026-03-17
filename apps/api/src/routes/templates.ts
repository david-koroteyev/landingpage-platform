import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { prisma } from '../config/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const templates = await prisma.template.findMany({
      where: {
        OR: [
          { isGlobal: true },
          { brandId: req.user!.brandId ?? undefined },
        ],
      },
      orderBy: { name: 'asc' },
    });
    res.json(templates);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const template = await prisma.template.findUnique({ where: { id: req.params.id } });
    if (!template) { res.status(404).json({ error: 'Template not found' }); return; }
    res.json(template);
  })
);

router.post(
  '/',
  requireRole('ADMIN'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { name, description, category, schema, thumbnail, isGlobal, brandId } = req.body;
    const template = await prisma.template.create({
      data: { name, description, category, schema, thumbnail, isGlobal: !!isGlobal, brandId },
    });
    res.status(201).json(template);
  })
);

router.delete(
  '/:id',
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    await prisma.template.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

export default router;
