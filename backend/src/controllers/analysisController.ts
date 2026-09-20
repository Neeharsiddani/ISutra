// ============================================================
// ISutra — Analysis Controller
// Phase 2: AI Requirement Understanding Endpoints
// ============================================================

import { Request, Response, NextFunction } from 'express';
import * as analysisService from '../services/analysisService';

export async function analyze(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { input_type, input_text, input_language } = req.body;

    if (!input_type || !input_text) {
      res.status(400).json({
        error: {
          message: 'input_type and input_text are required.',
          statusCode: 400,
        },
      });
      return;
    }

    if (typeof input_text !== 'string' || input_text.trim().length === 0) {
      res.status(400).json({
        error: {
          message: 'Specification text cannot be empty.',
          statusCode: 400,
        },
      });
      return;
    }

    const validTypes = [
      'product_description',
      'technical_specification',
      'tender_document',
    ];
    if (!validTypes.includes(input_type)) {
      res.status(400).json({
        error: {
          message: `input_type must be one of: ${validTypes.join(', ')}`,
          statusCode: 400,
        },
      });
      return;
    }

    const result = await analysisService.analyzeSpecification(
      input_type,
      input_text,
      input_language
    );

    res.json({
      data: result,
      demo: result.demo,
      warning: result.warning,
    });
  } catch (error) {
    next(error);
  }
}

export async function getHistory(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const history = await analysisService.getAnalysisHistory();
    res.json({
      data: history,
      demo: false,
    });
  } catch (error) {
    next(error);
  }
}

export async function getById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const analysis = await analysisService.getAnalysisById(id);

    if (!analysis) {
      res.status(404).json({
        error: {
          message: `Analysis record '${id}' not found.`,
          statusCode: 404,
        },
      });
      return;
    }

    res.json({
      data: analysis,
      demo: false,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateRequirements(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { requirements, confirmed } = req.body;

    if (!requirements) {
      res.status(400).json({
        error: {
          message: 'requirements object is required.',
          statusCode: 400,
        },
      });
      return;
    }

    const updated = await analysisService.updateAnalysisRequirements(
      id,
      requirements,
      Boolean(confirmed)
    );

    if (!updated) {
      res.status(404).json({
        error: {
          message: `Analysis record '${id}' not found.`,
          statusCode: 404,
        },
      });
      return;
    }

    res.json({
      data: updated,
      message: confirmed
        ? 'Requirements confirmed. Ready for Standards Matching.'
        : 'Requirements updated successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadDocument(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({
        error: {
          message: 'No file uploaded. Please upload a PDF, DOC, or DOCX file.',
          statusCode: 400,
        },
      });
      return;
    }

    const inputLanguage = req.body?.input_language;

    const result = await analysisService.analyzeDocument({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    }, inputLanguage);

    res.json({
      data: result,
      demo: result.demo,
      warning: result.warning,
      provenance: result.document_provenance,
    });
  } catch (error) {
    const err = error as any;
    if (err.isScannedOrEmpty) {
      res.status(422).json({
        error: {
          message: err.message,
          statusCode: 422,
          isScannedOrEmpty: true,
        },
      });
      return;
    }
    if (
      err.message?.includes('Unsupported file format') ||
      err.message?.includes('File size exceeds') ||
      err.message?.includes('File content does not match') ||
      err.message?.includes('Malformed')
    ) {
      res.status(400).json({
        error: {
          message: err.message,
          statusCode: 400,
        },
      });
      return;
    }
    next(error);
  }
}
