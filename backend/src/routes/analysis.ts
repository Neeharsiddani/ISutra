// ============================================================
// ISutra — Analysis Routes
// Phase 2: Requirements Extraction, History & Confirmation Endpoints
// ============================================================

import { Router } from 'express';
import multer from 'multer';
import * as analysisController from '../controllers/analysisController';

import * as recommendationsController from '../controllers/recommendationsController';

const router = Router();

// Multer configuration for tender document uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  },
});

// POST /api/analyze — Analyze text specification and extract structured requirements
router.post('/', analysisController.analyze);

// GET /api/analysis/history — Get previous analysis requests
router.get('/history', analysisController.getHistory);

// GET /api/analysis/:id — Get details & requirements of a specific analysis
router.get('/:id', analysisController.getById);

// PUT /api/analysis/:id/requirements — Update and confirm edited requirements
router.put('/:id/requirements', analysisController.updateRequirements);

// POST /api/analysis/upload — Upload and analyze tender document
router.post('/upload', upload.single('document'), analysisController.uploadDocument);

// POST /api/analysis/:id/recommendations — Match requirements of an analysis to BIS standards
router.post('/:id/recommendations', recommendationsController.getAnalysisRecommendations);
router.get('/:id/recommendations', recommendationsController.getAnalysisRecommendations);

// GET & POST /api/analysis/:id/recommendations/:standardId/gap-analysis — Phase 6: Gap analysis for standard
router.get('/:id/recommendations/:standardId/gap-analysis', recommendationsController.getRequirementGapAnalysis);
router.post('/:id/recommendations/:standardId/gap-analysis', recommendationsController.getRequirementGapAnalysis);

export default router;
