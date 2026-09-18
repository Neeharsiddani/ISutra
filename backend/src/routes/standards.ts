// ============================================================
// ISutra: Phase 3 — Standards Routes
// ============================================================

import { Router } from 'express';
import * as standardsController from '../controllers/standardsController';

const router = Router();

// GET /api/standards — List/search standards
router.get('/', standardsController.getAll);

// GET /api/standards/categories — List distinct categories and subcategories
router.get('/categories', standardsController.getCategories);

// GET /api/standards/:id — Get single standard details
router.get('/:id', standardsController.getById);

// GET /api/standards/:id/related — Get related standards
router.get('/:id/related', standardsController.getRelated);

// GET /api/standards/:id/lifecycle — Get verified BIS lifecycle and amendment intelligence
router.get('/:id/lifecycle', standardsController.getLifecycle);

// GET /api/standards/:id/amendments — Get amendments
router.get('/:id/amendments', standardsController.getAmendments);

// GET /api/standards/:id/certifications — Get certifications
router.get('/:id/certifications', standardsController.getCertifications);

export default router;
