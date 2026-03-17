import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as publishService from '../services/publishService.js';
import { prisma } from '../config/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// Publish a page
router.post(
  '/:pageId/publish',
  asyncHandler(async (req: AuthRequest, res) => {
    const { slug, meta } = req.body as { slug?: string; meta?: object };
    const result = await publishService.publishPage(req.params.pageId, req.user!.id, slug);
    res.json(result);
  })
);

// Unpublish a page
router.post(
  '/:pageId/unpublish',
  asyncHandler(async (req: AuthRequest, res) => {
    await publishService.unpublishPage(req.params.pageId);
    res.json({ ok: true });
  })
);

// Get publish history
router.get(
  '/:pageId/publishes',
  asyncHandler(async (req: AuthRequest, res) => {
    const records = await prisma.publishRecord.findMany({
      where: { pageId: req.params.pageId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        version: true,
        url: true,
        isActive: true,
        publishedBy: true,
        createdAt: true,
        publisher: { select: { id: true, name: true } },
      },
    });
    res.json(records);
  })
);

// Rollback to a previous publish
router.post(
  '/:pageId/publishes/:recordId/rollback',
  asyncHandler(async (req: AuthRequest, res) => {
    const result = await publishService.rollbackToPublishRecord(
      req.params.pageId,
      req.params.recordId,
      req.user!.id
    );
    res.json(result);
  })
);

export default router;
