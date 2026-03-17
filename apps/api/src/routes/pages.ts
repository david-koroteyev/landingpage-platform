import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { createPageSchema, updatePageSchema } from '@lp/shared';
import * as pageService from '../services/pageService.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// List pages with filtering
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const result = await pageService.listPages(
      req.user!.id,
      req.user!.role,
      req.query as Record<string, unknown>
    );
    res.json(result);
  })
);

// Get a single page
router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const page = await pageService.getPage(req.params.id);
    res.json(page);
  })
);

// Create a page
router.post(
  '/',
  validate(createPageSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const page = await pageService.createPage(req.body, req.user!.id);
    res.status(201).json(page);
  })
);

// Update a page (title, slug, schema, campaign, tags)
router.patch(
  '/:id',
  validate(updatePageSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const page = await pageService.updatePage(req.params.id, req.body, req.user!.id);
    res.json(page);
  })
);

// Duplicate a page
router.post(
  '/:id/duplicate',
  asyncHandler(async (req: AuthRequest, res) => {
    const page = await pageService.duplicatePage(req.params.id, req.user!.id);
    res.status(201).json(page);
  })
);

// Archive a page
router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    await pageService.archivePage(req.params.id);
    res.status(204).send();
  })
);

// List versions for a page
router.get(
  '/:id/versions',
  asyncHandler(async (req: AuthRequest, res) => {
    const versions = await pageService.listVersions(req.params.id);
    res.json(versions);
  })
);

// Restore a version
router.post(
  '/:id/versions/:versionId/restore',
  asyncHandler(async (req: AuthRequest, res) => {
    const page = await pageService.restoreVersion(req.params.id, req.params.versionId, req.user!.id);
    res.json(page);
  })
);

export default router;
