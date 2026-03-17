import { Router } from 'express';
import authRouter from './auth.js';
import pagesRouter from './pages.js';
import aiRouter from './ai.js';
import importRouter from './import.js';
import publishRouter from './publish.js';
import templatesRouter from './templates.js';
import { getPublishedPageBySlug } from '../services/publishService.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/pages', pagesRouter);
router.use('/ai', aiRouter);
router.use('/import', importRouter);
router.use('/pages', publishRouter); // mounts /pages/:id/publish etc.
router.use('/templates', templatesRouter);

// Public endpoint: render a published page by slug
router.get('/public/pages/:slug', async (req, res) => {
  const page = await getPublishedPageBySlug(req.params.slug);
  if (!page) { res.status(404).json({ error: 'Page not found' }); return; }
  res.json(page);
});

export default router;
