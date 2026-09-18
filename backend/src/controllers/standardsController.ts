// ============================================================
// ISutra: Phase 3 — Standards Controller
// Controller endpoints for verified BIS reference standards
// ============================================================

import { Request, Response, NextFunction } from 'express';
import * as standardsService from '../services/standardsService';

export async function getAll(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await standardsService.getAllStandards({
      search: req.query.search as string | undefined,
      keyword: req.query.keyword as string | undefined,
      is_number: req.query.is_number as string | undefined,
      standard_number: req.query.standard_number as string | undefined,
      title: req.query.title as string | undefined,
      category: req.query.category as string | undefined,
      subcategory: req.query.subcategory as string | undefined,
      status: req.query.status as any,
      edition_year: req.query.edition_year as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    });

    res.json({ data: result, demo: result.demo });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categoriesData = await standardsService.getCategories();
    res.json({ data: categoriesData });
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
    const result = await standardsService.getStandardById(req.params.id);

    if (!result) {
      res.status(404).json({
        error: { message: 'Standard not found', statusCode: 404 },
      });
      return;
    }

    res.json({ data: result.data, demo: result.demo });
  } catch (error) {
    next(error);
  }
}

export async function getRelated(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await standardsService.getRelatedStandards(req.params.id);
    res.json({
      data: result.data,
      coverage: (result as any).coverage,
      procurement_guidance: (result as any).procurement_guidance,
      demo: result.demo,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAmendments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await standardsService.getAmendments(req.params.id);
    res.json({
      data: result.data,
      demo: result.demo,
      verified: result.verified,
      notice: result.notice,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCertifications(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await standardsService.getCertifications(req.params.id);
    res.json({
      data: result.data,
      demo: result.demo,
      verified: result.verified,
      notice: result.notice,
    });
  } catch (error) {
    next(error);
  }
}

export async function getLifecycle(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { getStandardLifecycle } = await import('../services/standardLifecycleService');
    const result = getStandardLifecycle(req.params.id);
    res.json({
      lifecycle: result.lifecycle,
      amendments: result.amendments,
      coverage: result.coverage,
      notice: result.notice,
      data: result,
      demo: false,
    });
  } catch (error) {
    next(error);
  }
}
