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

    // Phase A: Enforce trustworthy matching readiness
    if (requirements.ready_for_matching === false) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Clarification required before finding applicable Indian Standards.',
          statusCode: 400,
          blocking_missing_information: requirements.blocking_missing_information || [],
          clarification_questions: requirements.clarification_questions || [],
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

    // Phase A: Enforce trustworthy matching readiness
    if (analysis.ready_for_matching === false || analysis.requirements?.ready_for_matching === false) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Clarification required before finding applicable Indian Standards.',
          statusCode: 400,
          blocking_missing_information:
            analysis.requirements?.blocking_missing_information ||
            analysis.blocking_missing_information ||
            [],
          clarification_questions:
            analysis.requirements?.clarification_questions ||
            analysis.clarification_questions ||
            [],
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

export async function getRequirementGapAnalysis(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const analysisId = req.params.id || req.body.analysisId;
    const standardId = req.params.standardId || req.body.standardId;
    let requirements = req.body.requirements;

    // If analysisId is provided, fetch requirements from the stored analysis
    if (analysisId) {
      const analysis = await analysisService.getAnalysisById(analysisId);
      if (!analysis) {
        res.status(404).json({
          success: false,
          error: {
            message: `Analysis record '${analysisId}' not found.`,
            statusCode: 404,
          },
        });
        return;
      }
      requirements = analysis.requirements;
    }

    if (!requirements || typeof requirements !== 'object') {
      res.status(400).json({
        success: false,
        error: {
          message: 'Structured requirements object or valid analysisId is required.',
          statusCode: 400,
        },
      });
      return;
    }

    // Check for vague / insufficient requirements
    const productName = requirements.product?.name?.toLowerCase().trim() || '';
    if (
      !productName ||
      productName === 'need something' ||
      productName === 'unspecified' ||
      requirements.ready_for_matching === false
    ) {
      res.status(400).json({
        success: false,
        error: {
          message:
            'Insufficient requirement details to perform gap analysis. Please supply a specific product, application, and technical parameters.',
          statusCode: 400,
          guidance: [
            'Specify the exact product or equipment type.',
            'Provide intended application and operating domain.',
            'Include technical parameters, environmental context, or installation methods.',
          ],
        },
      });
      return;
    }

    if (!standardId) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Target standardId is required to perform gap analysis.',
          statusCode: 400,
        },
      });
      return;
    }

    // Resolve standard from verified reference dataset
    const standard = VERIFIED_BIS_STANDARDS.find(
      (s) => s.id === standardId || s.standard_number === standardId
    );

    if (!standard) {
      res.status(404).json({
        success: false,
        error: {
          message: `Standard with ID '${standardId}' was not found in the verified BIS reference dataset.`,
          statusCode: 404,
        },
      });
      return;
    }

    // Import and execute gap analyzer
    const { analyzeRequirementGaps } = await import('../services/requirementGapAnalyzer');
    const gapAnalysis = analyzeRequirementGaps(requirements, standard);

    res.json({
      success: true,
      analysisId: analysisId || null,
      gapAnalysis,
    });
  } catch (error) {
    next(error);
  }
}

export async function compareStandardsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const analysisId = req.params.id || req.body.analysisId;
    let requirements = req.body.requirements;

    // Resolve standard IDs from query or body
    let rawIds: unknown = req.query.standards || req.body.standardIds || req.body.standards;
    let standardIds: string[] = [];

    if (typeof rawIds === 'string') {
      standardIds = rawIds.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (Array.isArray(rawIds)) {
      standardIds = rawIds.map((s) => String(s).trim()).filter(Boolean);
    }

    if (standardIds.length < 2 || standardIds.length > 3) {
      res.status(400).json({
        success: false,
        error: {
          message: `Comparison requires between 2 and 3 standards. Provided: ${standardIds.length}.`,
          statusCode: 400,
        },
      });
      return;
    }

    // If analysisId is present, retrieve stored requirements
    if (analysisId) {
      const analysis = await analysisService.getAnalysisById(analysisId);
      if (!analysis) {
        res.status(404).json({
          success: false,
          error: {
            message: `Analysis record '${analysisId}' not found.`,
            statusCode: 404,
          },
        });
        return;
      }
      requirements = analysis.requirements;
    }

    if (!requirements || typeof requirements !== 'object') {
      res.status(400).json({
        success: false,
        error: {
          message: 'Structured requirements object or valid analysisId is required.',
          statusCode: 400,
        },
      });
      return;
    }

    // Check for vague / insufficient requirements
    const productName = requirements.product?.name?.toLowerCase().trim() || '';
    if (
      !productName ||
      productName === 'need something' ||
      productName === 'unspecified' ||
      requirements.ready_for_matching === false
    ) {
      res.status(400).json({
        success: false,
        error: {
          message:
            'Insufficient requirement details to perform comparison. Please supply a specific product, application, and parameters.',
          statusCode: 400,
        },
      });
      return;
    }

    // Resolve standards from verified reference dataset
    const resolvedStandards = [];
    for (const sid of standardIds) {
      const std = VERIFIED_BIS_STANDARDS.find(
        (s) => s.id === sid || s.standard_number === sid
      );
      if (!std) {
        res.status(404).json({
          success: false,
          error: {
            message: `Standard with ID or number '${sid}' was not found in the verified BIS reference dataset.`,
            statusCode: 404,
          },
        });
        return;
      }
      resolvedStandards.push(std);
    }

    const { compareStandards } = await import('../services/standardsComparator');
    const comparisonResult = compareStandards(requirements, resolvedStandards);

    res.json({
      success: true,
      analysisId: analysisId || null,
      comparison: comparisonResult,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProcurementReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const analysisId = req.params.id;
    const { generateProcurementReportData } = await import('../services/procurementReportService');
    const reportData = await generateProcurementReportData(analysisId);
    res.json({
      success: true,
      report: reportData,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProcurementReportHtml(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const analysisId = req.params.id;
    const { generateProcurementReportData, generatePrintableHtmlReport } = await import('../services/procurementReportService');
    const reportData = await generateProcurementReportData(analysisId);
    const html = generatePrintableHtmlReport(reportData);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    next(error);
  }
}

