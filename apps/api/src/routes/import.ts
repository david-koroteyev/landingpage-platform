import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { importUrlSchema } from '@lp/shared';
import * as importService from '../services/importService.js';
import { prisma } from '../config/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// Kick off an import from a URL — returns immediately with a jobId for polling
router.post(
  '/url',
  validate(importUrlSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const { url, title } = req.body as { url: string; title?: string };
    const { jobId } = await importService.startImportJob(url, req.user!.id, title);
    res.status(202).json({ jobId });
  })
);

// Poll the status of an import job
router.get(
  '/job/:jobId',
  asyncHandler(async (req: AuthRequest, res) => {
    const job = await prisma.importJob.findUnique({
      where: { id: req.params.jobId },
      select: {
        id: true,
        url: true,
        status: true,
        step: true,
        resultPageId: true,
        error: true,
        createdAt: true,
        updatedAt: true,
        // Exclude screenshot from polling response (large payload)
      },
    });
    if (!job) {
      res.status(404).json({ error: 'Import job not found' });
      return;
    }
    res.json(job);
  })
);

export default router;
