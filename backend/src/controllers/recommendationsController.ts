// ============================================================
// ISutra: Phase 4 — Recommendations Controller
// API Endpoints for Intelligent BIS Standards Matching
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { matchRequirementsToStandards } from '../services/standardsMatcher';
import * as analysisService from '../services/analysisService';
import { VERIFIED_BIS_STANDARDS } from '../database/verifiedStandards';

export async function getRecommendations(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { requirements, options } = req.body;

    if (!requirements || typeof requirements !== 'object') {
      res.status(400).json({
        success: false,
        error: {
          message: 'Structured requirements object is required in request body.',
          statusCode: 400,
        },
      });
      return;
    }

    const result = matchRequirementsToStandards(requirements, VERIFIED_BIS_STANDARDS, options);

    res.json({
      success: true,
      recommendations: result.recommendations,
      metadata: result.metadata,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAnalysisRecommendations(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { options } = req.body || {};

    const analysis = await analysisService.getAnalysisById(id);

    if (!analysis) {
      res.status(404).json({
        success: false,
        error: {
          message: `Analysis record '${id}' not found.`,
          statusCode: 404,
        },
      });
      return;
    }

    const result = matchRequirementsToStandards(
      analysis.requirements,
      VERIFIED_BIS_STANDARDS,
      options
    );

    res.json({
      success: true,
      analysisId: id,
      confirmed: Boolean(analysis.confirmed),
      requirements: analysis.requirements,
      recommendations: result.recommendations,
      metadata: result.metadata,
    });
  } catch (error) {
    next(error);
  }
}
