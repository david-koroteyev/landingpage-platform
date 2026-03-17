import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { aiPromptRequestSchema, pageSchemaSchema } from '@lp/shared';
import * as aiService from '../services/aiService.js';
import { markPromptApplied } from '../services/aiService.js';
import { prisma } from '../config/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// Submit a natural language prompt and receive structured edit operations
router.post(
  '/prompt',
  validate(aiPromptRequestSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const { prompt, pageId, currentSchema } = req.body as {
      prompt: string;
      pageId: string;
      currentSchema: unknown;
    };

    // Verify the page exists and belongs to someone the user can edit
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page) throw new AppError(404, 'Page not found');

    // Validate the schema they sent (so we can trust it for context building)
    const schemaResult = pageSchemaSchema.safeParse(currentSchema);
    if (!schemaResult.success) {
      throw new AppError(422, 'Invalid page schema in request');
    }

    const result = await aiService.runAiPrompt(
      pageId,
      req.user!.id,
      prompt,
      schemaResult.data
    );

    res.json(result);
  })
);

// Mark prompt operations as applied (called by frontend after applying ops)
router.post(
  '/prompt/:promptLogId/applied',
  asyncHandler(async (req: AuthRequest, res) => {
    await markPromptApplied(req.params.promptLogId);
    res.json({ ok: true });
  })
);

// Get prompt history for a page
router.get(
  '/history/:pageId',
  asyncHandler(async (req: AuthRequest, res) => {
    const logs = await prisma.promptLog.findMany({
      where: { pageId: req.params.pageId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        prompt: true,
        operations: true,
        applied: true,
        model: true,
        tokensUsed: true,
        createdAt: true,
        user: { select: { id: true, name: true } },
      },
    });
    res.json(logs);
  })
);

export default router;
