// ============================================================
// ISutra: Phase 4 — Recommendations Routes
// POST /api/recommendations — Match requirements to BIS standards
// ============================================================

import { Router } from 'express';
import * as recommendationsController from '../controllers/recommendationsController';

const router = Router();

// POST /api/recommendations — Match given structured requirements
router.post('/', recommendationsController.getRecommendations);

// POST /api/recommendations/analysis/:id — Match requirements of an analysis record
router.post('/analysis/:id', recommendationsController.getAnalysisRecommendations);

// GET /api/recommendations/analysis/:id — Convenience GET route for analysis recommendations
router.get('/analysis/:id', recommendationsController.getAnalysisRecommendations);

export default router;
