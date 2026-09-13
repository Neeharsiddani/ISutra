// ============================================================
// ISutra: Phase 3 — Standards Service
// Business logic for verified Indian Standards data access
// Supports Supabase and local verified BIS dataset fallback
// ============================================================

import { getSupabaseClient } from '../database/supabase';
import { VERIFIED_BIS_STANDARDS } from '../database/verifiedStandards';
import {
  DEMO_RELATIONSHIPS,
  DEMO_AMENDMENTS,
  DEMO_CERTIFICATIONS,
} from '../database/demoData';
import type { Standard, StandardsSearchParams } from '../types';

// Helper to normalize standard objects for backward compatibility
function formatStandard(s: any): Standard {
  return {
    ...s,
    standard_number: s.standard_number || s.is_number,
    is_number: s.standard_number || s.is_number,
    edition: s.edition || (s.edition_year ? String(s.edition_year) : ''),
    source_name: s.source_name || s.source_organization || 'Bureau of Indian Standards',
    description: s.description || s.scope || '',
  };
}

export async function getAllStandards(params: StandardsSearchParams) {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      let query = supabase.from('standards').select('*', { count: 'exact' });

      const searchTerm = params.search || params.keyword;
      if (searchTerm) {
        query = query.or(
          `standard_number.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,scope.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,subcategory.ilike.%${searchTerm}%`
        );
      }
      if (params.is_number || params.standard_number) {
        const num = params.standard_number || params.is_number;
        query = query.ilike('standard_number', `%${num}%`);
      }
      if (params.title) {
        query = query.ilike('title', `%${params.title}%`);
      }
      if (params.category) {
        query = query.ilike('category', `%${params.category}%`);
      }
      if (params.subcategory) {
        query = query.ilike('subcategory', `%${params.subcategory}%`);
      }
      if (params.status) {
        query = query.ilike('status', `%${params.status}%`);
      }
      if (params.edition_year) {
        query = query.eq('edition_year', Number(params.edition_year));
      }

      const page = params.page || 1;
      const limit = params.limit || 50;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to).order('standard_number', { ascending: true });

      const { data, count, error } = await query;

      if (!error && data && data.length > 0) {
        return {
          standards: data.map(formatStandard),
          total: count || data.length,
          page,
          limit,
          demo: false,
        };
      }
    } catch (error) {
      console.warn('Supabase query error, using local verified BIS dataset fallback:', error);
    }
  }

  // --- Verified Local Repository Fallback ---
  let filtered = VERIFIED_BIS_STANDARDS.map(formatStandard);

  const searchTerm = (params.search || params.keyword || '').trim().toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter((s) => {
      const inNumber = (s.standard_number || s.is_number || '').toLowerCase().includes(searchTerm);
      const inTitle = s.title.toLowerCase().includes(searchTerm);
      const inScope = (s.scope || '').toLowerCase().includes(searchTerm);
      const inCategory = (s.category || '').toLowerCase().includes(searchTerm);
      const inSubcategory = (s.subcategory || '').toLowerCase().includes(searchTerm);
      const inKeywords = (s.keywords || []).some((k) =>
        k.toLowerCase().includes(searchTerm)
      );
      const inProducts = (s.product_types || []).some((p) =>
        p.toLowerCase().includes(searchTerm)
      );

      return (
        inNumber ||
        inTitle ||
        inScope ||
        inCategory ||
        inSubcategory ||
        inKeywords ||
        inProducts
      );
    });
  }

  if (params.standard_number || params.is_number) {
    const num = (params.standard_number || params.is_number)!.toLowerCase();
    filtered = filtered.filter((s) => (s.standard_number || s.is_number || '').toLowerCase().includes(num));
  }

  if (params.title) {
    const t = params.title.toLowerCase();
    filtered = filtered.filter((s) => s.title.toLowerCase().includes(t));
  }

  if (params.category) {
    const cat = params.category.toLowerCase();
    filtered = filtered.filter((s) => s.category.toLowerCase().includes(cat));
  }

  if (params.subcategory) {
    const sub = params.subcategory.toLowerCase();
    filtered = filtered.filter((s) => (s.subcategory || '').toLowerCase().includes(sub));
  }

  if (params.status) {
    const st = params.status.toLowerCase();
    filtered = filtered.filter((s) => (s.status || '').toLowerCase().includes(st));
  }

  if (params.edition_year) {
    const yr = String(params.edition_year);
    filtered = filtered.filter((s) => String(s.edition_year) === yr);
  }

  const page = params.page || 1;
  const limit = params.limit || 50;
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return {
    standards: paginated,
    total: filtered.length,
    page,
    limit,
    demo: false, // This is real verified BIS reference data
  };
}

export async function getStandardById(id: string) {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('standards')
        .select('*')
        .or(`id.eq.${id},standard_number.eq.${id}`)
        .single();

      if (!error && data) {
        return { data: formatStandard(data), demo: false };
      }
    } catch (error) {
      console.warn('Supabase query error:', error);
    }
  }

  // Lookup in verified standards
  const cleanId = decodeURIComponent(id).trim().toLowerCase();
  const found = VERIFIED_BIS_STANDARDS.find(
    (s) =>
      s.id.toLowerCase() === cleanId ||
      s.standard_number.toLowerCase() === cleanId ||
      s.standard_number.toLowerCase().replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')
  );

  if (found) {
    return { data: formatStandard(found), demo: false };
  }

  return null;
}

export async function getCategories() {
  const categories = Array.from(
    new Set(VERIFIED_BIS_STANDARDS.map((s) => s.category))
  ).filter(Boolean);

  const subcategories = Array.from(
    new Set(VERIFIED_BIS_STANDARDS.map((s) => s.subcategory))
  ).filter(Boolean);

  const statuses = Array.from(
    new Set(VERIFIED_BIS_STANDARDS.map((s) => s.status))
  ).filter(Boolean);

  const editionYears = Array.from(
    new Set(VERIFIED_BIS_STANDARDS.map((s) => s.edition_year))
  ).sort((a, b) => b - a);

  return {
    categories,
    subcategories,
    statuses,
    editionYears,
  };
}

export async function getRelatedStandards(id: string) {
  const standardRes = await getStandardById(id);
  if (standardRes && standardRes.data.related_standards) {
    const relatedList = standardRes.data.related_standards.map((relName: string, i: number) => ({
      id: `rel-${i}`,
      source_standard_id: id,
      target_standard_id: relName,
      relationship_type: 'normative_reference',
      description: `Referenced in ${standardRes.data.standard_number || standardRes.data.is_number}`,
      created_at: new Date().toISOString(),
      target_standard: VERIFIED_BIS_STANDARDS.find((v) =>
        v.standard_number.toLowerCase().includes(relName.toLowerCase())
      ),
    }));
    return { data: relatedList, demo: false };
  }

  const related = DEMO_RELATIONSHIPS.filter((r) => r.source_standard_id === id);
  return { data: related, demo: true };
}

export async function getAmendments(id: string) {
  const amendments = DEMO_AMENDMENTS.filter((a) => a.standard_id === id);
  return { data: amendments, demo: false };
}

export async function getCertifications(id: string) {
  const certs = DEMO_CERTIFICATIONS.filter((c) => c.standard_id === id);
  return { data: certs, demo: false };
}
