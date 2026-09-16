// ============================================================
// ISutra: Phase 3 — Indian Standards Directory & Search
// Connected to Verified BIS Reference Standards Dataset
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  ArrowUpDown,
} from 'lucide-react';
import type { Standard } from '../types';
import { getStandards, getStandardsCategories } from '../services/api';
import StandardTable from '../components/standards/StandardTable';
import LoadingState from '../components/ui/LoadingState';
import EmptyState from '../components/ui/EmptyState';

export default function StandardsSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [standards, setStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editionYear, setEditionYear] = useState('');
  const [sortBy, setSortBy] = useState<'standard_number' | 'title' | 'edition_year'>('standard_number');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Metadata options from database
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [editionYearOptions, setEditionYearOptions] = useState<number[]>([]);

  // Load filter metadata
  useEffect(() => {
    async function loadMeta() {
      try {
        const meta = await getStandardsCategories();
        setCategoryOptions(meta.categories || []);
        setSubcategoryOptions(meta.subcategories || []);
        setStatusOptions(meta.statuses || []);
        setEditionYearOptions(meta.editionYears || []);
      } catch (e) {
        console.warn('Failed to load categories meta:', e);
      }
    }
    loadMeta();
  }, []);

  // Fetch standards with active parameters
  const fetchStandards = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getStandards({
        search: searchQuery || undefined,
        category: category || undefined,
        subcategory: subcategory || undefined,
        status: statusFilter || undefined,
        edition_year: editionYear || undefined,
        limit: 50,
      });

      let items = result.standards || [];

      // Client-side sorting
      items.sort((a, b) => {
        let valA = '';
        let valB = '';

        if (sortBy === 'edition_year') {
          const numA = Number(a.edition_year || a.edition || 0);
          const numB = Number(b.edition_year || b.edition || 0);
          return sortOrder === 'asc' ? numA - numB : numB - numA;
        }

        if (sortBy === 'title') {
          valA = (a.title || '').toLowerCase();
          valB = (b.title || '').toLowerCase();
        } else {
          valA = (a.standard_number || a.is_number || '').toLowerCase();
          valB = (b.standard_number || b.is_number || '').toLowerCase();
        }

        return sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      });

      setStandards(items);
    } catch {
      setStandards([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, category, subcategory, statusFilter, editionYear, sortBy, sortOrder]);

  // Sync with URL query param if present
  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchStandards();
  }, [fetchStandards]);

  const clearFilters = () => {
    setSearchQuery('');
    setCategory('');
    setSubcategory('');
    setStatusFilter('');
    setEditionYear('');
    setSortBy('standard_number');
    setSortOrder('asc');
    setSearchParams({});
  };

  const hasActiveFilters =
    searchQuery || category || subcategory || statusFilter || editionYear;

  return (
    <div className="space-y-6 w-full pb-16 animate-fade-in text-[#243B53]">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#243B53]/10 pb-5">
        <div>
          <h1 className="text-[26px] sm:text-[30px] xl:text-[32px] font-bold text-[#102A43] tracking-tight font-display">
            Indian Standards Directory
          </h1>
          <p className="text-[14px] sm:text-[15px] text-[#627D98] mt-1">
            Search and browse verified reference Indian Standards by number, title, subcategory, or product application.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3.5 py-1.5 rounded-full bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/20 text-[13px] font-semibold flex items-center gap-1.5 font-display">
            <BookOpen className="w-4 h-4" />
            {standards.length} Verified BIS Reference Standards
          </span>
        </div>
      </div>

      {/* 2. Mandatory BIS Verified Dataset Notice Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0F766E]/5 to-transparent border border-[#0F766E]/25 rounded-2xl flex items-start gap-3.5 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />
        <div className="text-[13px] sm:text-[14px] leading-relaxed">
          <span className="font-bold text-[#102A43] block text-[14px] sm:text-[15px] font-display">
            Verified BIS Reference Dataset
          </span>
          <p className="mt-0.5 text-[#243B53]/85">
            This directory contains verified metadata for Indian Standards across critical infrastructure sectors (Electrical, Lighting, Power Cables, Civil Construction, Steel, and Safety PPE). ISutra is a prototype reference system and is not an official BIS service.
          </p>
        </div>
      </div>

      {/* 3. Search Bar & Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#243B53]/10 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9FB3C8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search standards (e.g., 'street light', 'LED luminaire', 'floodlight', '10322')..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F7F9FC] border border-[#243B53]/15 rounded-xl text-[14px] sm:text-[15px] text-[#243B53] placeholder:text-[#9FB3C8] focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] outline-hidden transition-all"
              id="standards-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9FB3C8] hover:text-[#243B53]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-xl text-[13px] sm:text-[14px] font-semibold border flex items-center gap-2 transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-[#0F766E] text-white border-[#0F766E]'
                  : 'bg-[#F7F9FC] text-[#243B53] border-[#243B53]/15 hover:border-[#0F766E]/40'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              )}
            </button>

            {/* Sort Toggle */}
            <div className="flex items-center border border-[#243B53]/15 rounded-xl bg-[#F7F9FC] p-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-[13px] font-medium text-[#243B53] px-2 py-1 outline-hidden cursor-pointer"
                title="Sort by"
              >
                <option value="standard_number">IS Number</option>
                <option value="title">Title</option>
                <option value="edition_year">Edition Year</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 rounded-lg hover:bg-white text-[#627D98] hover:text-[#102A43] transition-colors"
                title={`Order: ${sortOrder.toUpperCase()}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Filters Section */}
        {showFilters && (
          <div className="pt-4 border-t border-[#243B53]/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 animate-fade-in">
            {/* Subcategory */}
            <div>
              <label className="block text-[11px] font-bold text-[#627D98] uppercase tracking-wider mb-1.5 font-display">
                Subcategory
              </label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full text-[13px] p-2 bg-[#F7F9FC] border border-[#243B53]/15 rounded-xl text-[#243B53] outline-hidden focus:border-[#0F766E]"
              >
                <option value="">All Subcategories</option>
                {subcategoryOptions.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-bold text-[#627D98] uppercase tracking-wider mb-1.5 font-display">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-[13px] p-2 bg-[#F7F9FC] border border-[#243B53]/15 rounded-xl text-[#243B53] outline-hidden focus:border-[#0F766E]"
              >
                <option value="">All Categories</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[11px] font-bold text-[#627D98] uppercase tracking-wider mb-1.5 font-display">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-[13px] p-2 bg-[#F7F9FC] border border-[#243B53]/15 rounded-xl text-[#243B53] outline-hidden focus:border-[#0F766E]"
              >
                <option value="">All Statuses</option>
                {statusOptions.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Edition Year */}
            <div>
              <label className="block text-[11px] font-bold text-[#627D98] uppercase tracking-wider mb-1.5 font-display">
                Edition Year
              </label>
              <select
                value={editionYear}
                onChange={(e) => setEditionYear(e.target.value)}
                className="w-full text-[13px] p-2 bg-[#F7F9FC] border border-[#243B53]/15 rounded-xl text-[#243B53] outline-hidden focus:border-[#0F766E]"
              >
                <option value="">All Years</option>
                {editionYearOptions.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-2">
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#627D98] hover:text-[#C53030] hover:bg-[#FEF2F2] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Standards Results Table / Cards */}
      {loading ? (
        <div className="py-16">
          <LoadingState message="Querying verified BIS standards dataset..." />
        </div>
      ) : standards.length === 0 ? (
        <EmptyState
          title="No Matching Standards Found"
          description="Try broadening your search term or clearing the active filters."
          action={
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl bg-[#0F766E] text-white text-[13px] font-semibold hover:bg-[#0D655E] transition-all"
            >
              Clear Filters
            </button>
          }
        />
      ) : (
        <StandardTable standards={standards} />
      )}
    </div>
  );
}
