// ============================================================
// ISutra: SIH26108 — Allied Standards Intelligence
// Evidence-Backed Relationship Explorer & Audit Workspace
// Organizes allied standards into:
// 1. Verified Relationships (Normative, Test Method, Safety, etc.)
// 2. Associated References (Unclassified)
// 3. Verification Required (Procurement Officer Checklist)
// ============================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
  Info,
  FileText,
  AlertTriangle,
  GitBranch,
  FileCheck2,
  CheckCircle2,
  Search,
  Check,
} from 'lucide-react';
import type {
  Standard,
  StandardRelationship,
  RelationshipCoverage,
  RelationshipType,
} from '../../types';

interface AlliedStandardsExplorerProps {
  currentStandard: Standard;
  relationships: StandardRelationship[];
  coverage?: RelationshipCoverage | null;
  procurementGuidance?: string | null;
  fromAnalysis?: string;
}

export const AlliedStandardsExplorer: React.FC<AlliedStandardsExplorerProps> = ({
  currentStandard,
  relationships,
  coverage,
  procurementGuidance,
  fromAnalysis,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'verified' | 'associated' | 'verification'>(
    'all'
  );

  const stdNumber = currentStandard.standard_number || currentStandard.is_number || 'Standard';

  // Group into verified relationships vs unclassified references
  const verifiedList = relationships.filter((r) => r.verification_status === 'verified');
  const associatedList = relationships.filter((r) => r.verification_status !== 'verified');

  const verifiedCount = coverage?.verified_count ?? verifiedList.length;
  const unclassifiedCount = coverage?.unclassified_count ?? associatedList.length;

  // Format relationship type label
  const formatRelationshipLabel = (type: RelationshipType | 'unspecified' | null | undefined): string => {
    switch (type) {
      case 'normative_reference':
        return 'Normative Reference';
      case 'test_method':
        return 'Test Method';
      case 'safety_standard':
        return 'Safety Standard';
      case 'installation_standard':
        return 'Installation Standard';
      case 'terminology':
        return 'Terminology Standard';
      case 'related_product':
        return 'Related Product';
      case 'allied_standard':
        return 'Allied Standard';
      default:
        return 'Associated Reference';
    }
  };

  // Badge styling per relationship type
  const getBadgeStyle = (type: RelationshipType | 'unspecified' | null | undefined, isVerified: boolean) => {
    if (!isVerified) {
      return 'bg-slate-100 text-slate-700 border-slate-300';
    }
    switch (type) {
      case 'normative_reference':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'test_method':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'safety_standard':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      case 'installation_standard':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      case 'terminology':
        return 'bg-cyan-50 text-cyan-800 border-cyan-300';
      case 'related_product':
        return 'bg-indigo-50 text-indigo-800 border-indigo-300';
      case 'allied_standard':
      default:
        return 'bg-teal-50 text-teal-800 border-teal-300';
    }
  };

  return (
    <div
      id="relationships"
      className="bg-white rounded-2xl border border-[#243B53]/10 p-6 sm:p-7 shadow-xs space-y-6 w-full scroll-mt-6"
    >
      {/* ============================================================
          1. HEADER ROW: Title, Subtitle, Reference Count Badges
         ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#243B53]/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#0F766E]/10 text-[#0F766E]">
              <GitBranch className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#102A43] font-display flex items-center gap-2">
                Associated & Allied Standards
              </h3>
              <p className="text-xs sm:text-sm text-[#627D98] mt-0.5">
                Evidence-backed relationship intelligence and associated standard citations for{' '}
                <span className="font-semibold text-[#102A43]">{stdNumber}</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Coverage Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{verifiedCount} Verified</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>{unclassifiedCount} Associated</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-medium">
            <FileCheck2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Checklist Active</span>
          </span>
        </div>
      </div>

      {/* ============================================================
          2. VISUAL RELATIONSHIP EXPLORER (TREE DIAGRAM)
         ============================================================ */}
      <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-[#0F766E]" />
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#102A43]">
              Visual Relationship Hierarchy
            </h4>
          </div>
          <span className="text-[11px] text-[#627D98] italic">
            Authoritative BIS Citations (Click any node to inspect)
          </span>
        </div>

        {/* Interactive Tree Structure */}
        <div className="relative pl-3 sm:pl-6 pt-2 pb-2">
          {/* Root Node: Current Selected Standard */}
          <div className="inline-flex items-center gap-3 p-3.5 bg-white rounded-xl border-2 border-[#0F766E] shadow-xs max-w-full">
            <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs shrink-0">
              IS
            </div>
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0F766E] font-mono tracking-tight">
                  CURRENT STANDARD
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold uppercase">
                  Active
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[#102A43] font-mono truncate">
                {stdNumber}
              </h4>
              <p className="text-xs text-[#486581] truncate max-w-md">
                {currentStandard.title}
              </p>
            </div>
          </div>

          {/* Vertical Stem */}
          <div className="w-0.5 bg-slate-300 h-6 ml-4 sm:ml-4 my-1" />

          {/* Allied Branches */}
          {relationships.length > 0 ? (
            <div className="space-y-3 relative pl-6 border-l-2 border-slate-300 ml-4">
              {relationships.map((rel, idx) => {
                const isVerified = rel.verification_status === 'verified';
                const targetNum =
                  rel.target_standard?.standard_number ||
                  rel.target_standard_number ||
                  rel.target_standard_id;
                const targetTitle =
                  rel.target_standard?.title || rel.description;
                const badgeStyle = getBadgeStyle(rel.relationship_type, isVerified);
                const typeLabel = formatRelationshipLabel(rel.relationship_type);

                return (
                  <div key={rel.id || idx} className="relative group">
                    {/* Horizontal Branch Line */}
                    <div className="absolute -left-6 top-5 w-6 h-0.5 bg-slate-300" />

                    <div
                      className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isVerified
                          ? 'bg-white border-emerald-300 shadow-2xs hover:border-emerald-500 hover:shadow-xs'
                          : 'bg-white/80 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        {/* Status Icon */}
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                            isVerified
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isVerified ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Layers className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${badgeStyle}`}
                            >
                              {isVerified ? typeLabel : 'Associated Reference'}
                            </span>
                            {isVerified && (
                              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                Verified Clause Evidence
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-sm font-mono text-[#102A43]">
                              {targetNum}
                            </span>
                            <span className="text-xs text-[#486581] truncate max-w-sm hidden sm:inline">
                              — {targetTitle}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Node Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {rel.target_standard ? (
                          <Link
                            to={`/standards/${rel.target_standard.id}${fromAnalysis ? `?fromAnalysis=${fromAnalysis}` : ''}`}
                            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 inline-flex items-center gap-1 transition-colors"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <Link
                            to={`/standards?search=${encodeURIComponent(targetNum)}`}
                            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 inline-flex items-center gap-1 transition-colors"
                          >
                            <Search className="w-3 h-3" />
                            <span>Catalogue</span>
                          </Link>
                        )}

                        {rel.verified_source_url && (
                          <a
                            href={rel.verified_source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-[#627D98] hover:text-[#0F766E] inline-flex items-center gap-1 transition-colors"
                            title="Verify at official Bureau of Indian Standards portal"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>Verify at BIS</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-500 italic ml-4">
              No allied standards or references recorded for this standard in the curated dataset.
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          3. NAVIGATION TABS (Filter Views)
         ============================================================ */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#102A43] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Allied Standards ({relationships.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('verified')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
            activeTab === 'verified'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>1. Verified Relationships ({verifiedCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('associated')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
            activeTab === 'associated'
              ? 'bg-slate-700 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>2. Associated References ({unclassifiedCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('verification')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
            activeTab === 'verification'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>3. Verification Required (Procurement Advisory)</span>
        </button>
      </div>

      {/* ============================================================
          SECTION 1: VERIFIED RELATIONSHIPS (Normative, Test Method, etc.)
         ============================================================ */}
      {(activeTab === 'all' || activeTab === 'verified') && (
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#102A43]">
                1. Verified Relationships (Authoritative Clause Evidence)
              </h4>
            </div>
            <span className="text-xs text-[#0F766E] font-medium bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {verifiedList.length} verified citations
            </span>
          </div>

          {verifiedList.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {verifiedList.map((rel, idx) => {
                const targetNum =
                  rel.target_standard?.standard_number ||
                  rel.target_standard_number ||
                  rel.target_standard_id;
                const targetTitle =
                  rel.target_standard?.title || rel.description;
                const typeLabel = formatRelationshipLabel(rel.relationship_type);
                const badgeStyle = getBadgeStyle(rel.relationship_type, true);

                return (
                  <div
                    key={rel.id || idx}
                    className="p-5 rounded-2xl bg-white border border-emerald-300/80 shadow-xs hover:border-emerald-500 transition-all space-y-4"
                  >
                    {/* Top Row: Relationship Badge + Target Standard */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase border ${badgeStyle}`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Relationship: {typeLabel}</span>
                          </span>
                          <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded">
                            Mandatory & Normative Trace
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold font-mono text-[#102A43]">
                          Related Standard: {targetNum}
                        </h4>
                        <p className="text-xs sm:text-sm text-[#334E68] mt-0.5 font-medium leading-relaxed">
                          {targetTitle}
                        </p>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {rel.target_standard ? (
                          <Link
                            to={`/standards/${rel.target_standard.id}${fromAnalysis ? `?fromAnalysis=${fromAnalysis}` : ''}`}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                          >
                            <span>View Standard</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : null}

                        {rel.verified_source_url && (
                          <a
                            href={rel.verified_source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white inline-flex items-center gap-1.5 transition-all shadow-2xs"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verify at BIS</span>
                            <ExternalLink className="w-3 h-3 opacity-80" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* "Why is this related?" Procurement Callout Box */}
                    <div className="bg-emerald-50/40 border border-emerald-200/90 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#102A43] uppercase tracking-wider">
                        <FileText className="w-3.5 h-3.5 text-[#0F766E]" />
                        <span>Why Is This Related?</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                        <div>
                          <span className="text-[#627D98] font-semibold block text-[11px] uppercase">
                            Relationship Type:
                          </span>
                          <span className="text-[#102A43] font-bold">
                            {typeLabel}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#627D98] font-semibold block text-[11px] uppercase">
                            Source Provenance:
                          </span>
                          <span className="text-[#102A43] font-medium">
                            {rel.source_provenance || 'Official BIS Reference Clause Citation'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#627D98] font-semibold block text-[11px] uppercase">
                            Verification Status:
                          </span>
                          <span className="text-emerald-800 font-bold inline-flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" /> Curated & Verified
                          </span>
                        </div>
                        <div>
                          <span className="text-[#627D98] font-semibold block text-[11px] uppercase">
                            Audited Against:
                          </span>
                          <span className="text-[#102A43] font-medium">
                            Official Bureau of Indian Standards Publication
                          </span>
                        </div>
                      </div>

                      {/* Evidence Clause */}
                      {rel.evidence_clause && (
                        <div className="mt-3 pt-2.5 border-t border-emerald-200/70">
                          <span className="text-[11px] text-[#627D98] font-semibold uppercase block mb-1">
                            Evidence (Clause / Scope Citation):
                          </span>
                          <p className="text-xs sm:text-[13px] font-mono bg-white p-3 rounded-lg border border-emerald-200 text-[#102A43] leading-relaxed">
                            {rel.evidence_clause}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 italic">
              No verified relationship records are currently compiled for this standard. Unclassified references are listed below.
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          SECTION 2: ASSOCIATED REFERENCES (Unclassified)
         ============================================================ */}
      {(activeTab === 'all' || activeTab === 'associated') && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#102A43]">
                2. Associated References (Citations in Scope or Specifications)
              </h4>
            </div>
            <span className="text-xs text-slate-600 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {associatedList.length} references
            </span>
          </div>

          {/* Explicit Trust Alert: Never treat as normative without verification */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#334E68] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-[#102A43]">Associated Reference Notice: </strong>
              These standards are cited within the scope, descriptions, or technical parameters of{' '}
              <span className="font-semibold">{stdNumber}</span>, but specific clause relationships (normative, test method, or allied guide) have not been verified in the current curated ISutra dataset.
              <strong className="text-slate-900"> Do not present or assume these as normative without verifying the official BIS publication.</strong>
            </p>
          </div>

          {associatedList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {associatedList.map((rel, idx) => {
                const targetNum =
                  rel.target_standard?.standard_number ||
                  rel.target_standard_number ||
                  rel.target_standard_id;
                const targetTitle =
                  rel.target_standard?.title || rel.description;

                return (
                  <div
                    key={rel.id || idx}
                    className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                          <Layers className="w-3 h-3 text-slate-500" />
                          <span>Associated Reference</span>
                        </span>
                        <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                          Type not verified
                        </span>
                      </div>

                      <div>
                        <h5 className="text-sm font-bold font-mono text-[#102A43]">
                          {targetNum}
                        </h5>
                        <p className="text-xs text-[#486581] mt-0.5 line-clamp-2 leading-snug">
                          {targetTitle}
                        </p>
                      </div>

                      <p className="text-[11px] text-[#627D98] italic">
                        Relationship type not verified in current ISutra dataset.
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      {rel.target_standard ? (
                        <Link
                          to={`/standards/${rel.target_standard.id}${fromAnalysis ? `?fromAnalysis=${fromAnalysis}` : ''}`}
                          className="text-[#0F766E] hover:text-[#0C5D57] font-semibold inline-flex items-center gap-1"
                        >
                          <span>Inspect Standard</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <Link
                          to={`/standards?search=${encodeURIComponent(targetNum)}`}
                          className="text-[#0F766E] hover:text-[#0C5D57] font-medium inline-flex items-center gap-1"
                        >
                          <Search className="w-3 h-3" />
                          <span>Search Catalogue</span>
                        </Link>
                      )}

                      {rel.verified_source_url && (
                        <a
                          href={rel.verified_source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-600 hover:text-[#0F766E] font-medium inline-flex items-center gap-1"
                        >
                          <span>Verify at BIS</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 italic">
              No unclassified associated references recorded for this standard.
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          SECTION 3: VERIFICATION REQUIRED (Procurement Officer Advisory)
         ============================================================ */}
      {(activeTab === 'all' || activeTab === 'verification') && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#102A43]">
              3. Verification Required (Procurement Compliance Advisory)
            </h4>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div className="space-y-1">
                <h5 className="text-sm font-bold text-amber-950">
                  Procurement Officer Verification Checklist
                </h5>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Before finalizing tender specifications or signing off on technical evaluation sheets, the procurement committee must verify the following items against the official Bureau of Indian Standards source publications:
                </p>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-2xs space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1. Normative vs Informative Scope</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pl-6">
                  Confirm whether referenced standards are mandatory (cited in normative body clauses) or advisory (cited in non-mandatory forewords, notes, or informative annexures).
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-2xs space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>2. Latest Published Amendments</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pl-6">
                  Verify whether post-publication amendments published in the Gazette of India modify testing methods, dimensions, or material limits for referenced standards.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-2xs space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>3. Test Method & NABL Lab Accreditation</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pl-6">
                  Ensure manufacturer compliance test reports cite the exact test method standard specified and originate from a NABL / BIS accredited laboratory.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-2xs space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>4. Mandatory Quality Control Orders (QCOs)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pl-6">
                  Inspect the relevant Central Line Ministry website to check if a mandatory QCO applies to the parent or allied product standard under the BIS Act, 2016.
                </p>
              </div>
            </div>

            {/* Procurement Guidance & External Portal Link */}
            <div className="pt-2 border-t border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-amber-950 font-medium text-[11px]">
                {procurementGuidance ||
                  'Verify relationship type and applicability against the official BIS publication before finalizing procurement specifications.'}
              </span>
              <a
                href="https://www.bis.gov.in/know-your-standard/?lang=en"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shrink-0 shadow-2xs"
              >
                <span>Open BIS Know Your Standard Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
