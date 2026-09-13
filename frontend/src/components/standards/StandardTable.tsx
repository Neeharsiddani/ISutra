// ============================================================
// ISutra: Phase 3 — Standards Directory Table & Card List
// Displays verified Bureau of Indian Standards (BIS) reference records
// ============================================================

import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Standard } from '../../types';

interface StandardTableProps {
  standards: Standard[];
}

export default function StandardTable({ standards }: StandardTableProps) {
  return (
    <div className="space-y-4">
      {/* Desktop / Tablet Table (Hidden on small mobile) */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl border border-[#243B53]/10 shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#243B53]/10 bg-[#F7F9FC]/60">
              <th className="py-3.5 px-5 text-[12px] font-bold text-[#627D98] uppercase tracking-wider font-display">
                Standard Number
              </th>
              <th className="py-3.5 px-5 text-[12px] font-bold text-[#627D98] uppercase tracking-wider font-display">
                Title & Subcategory
              </th>
              <th className="py-3.5 px-5 text-[12px] font-bold text-[#627D98] uppercase tracking-wider font-display">
                Edition
              </th>
              <th className="py-3.5 px-5 text-[12px] font-bold text-[#627D98] uppercase tracking-wider font-display">
                Status
              </th>
              <th className="py-3.5 px-5 text-[12px] font-bold text-[#627D98] uppercase tracking-wider font-display">
                Source
              </th>
              <th className="py-3.5 px-5 text-[12px] font-bold text-[#627D98] uppercase tracking-wider text-right font-display">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#243B53]/5">
            {standards.map((standard) => {
              const stdNumber = standard.standard_number || standard.is_number;
              const isCurrent = standard.status?.toLowerCase().includes('current');

              return (
                <tr
                  key={standard.id}
                  className="hover:bg-[#F7F9FC]/80 transition-colors group"
                >
                  <td className="py-4 px-5 align-top">
                    <span className="text-[14px] font-bold text-[#0F766E] font-display block whitespace-nowrap">
                      {stdNumber}
                    </span>
                  </td>
                  <td className="py-4 px-5 max-w-md">
                    <div className="text-[14px] font-medium text-[#102A43] leading-snug">
                      {standard.title}
                    </div>
                    <div className="text-[12px] text-[#627D98] mt-1 flex items-center gap-1.5">
                      <span>{standard.category}</span>
                      {standard.subcategory && (
                        <>
                          <span className="text-[#9FB3C8]">→</span>
                          <span className="font-medium text-[#243B53]">{standard.subcategory}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-5 align-top whitespace-nowrap">
                    <span className="text-[13px] font-semibold text-[#243B53]">
                      {standard.edition_year || standard.edition || '—'}
                    </span>
                  </td>
                  <td className="py-4 px-5 align-top whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        isCurrent
                          ? 'bg-emerald-50 text-[#16803C] border-emerald-300'
                          : 'bg-amber-50 text-[#D97706] border-amber-300'
                      }`}
                    >
                      {isCurrent ? (
                        <CheckCircle2 className="w-3 h-3 text-[#16803C]" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-[#D97706]" />
                      )}
                      {standard.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 align-top whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#627D98]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
                      Bureau of Indian Standards
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right align-top whitespace-nowrap">
                    <Link
                      to={`/standards/${encodeURIComponent(standard.id)}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-[#0F766E] hover:text-white hover:bg-[#0F766E] border border-[#0F766E]/30 hover:border-[#0F766E] transition-all shadow-2xs"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout (< 768px) */}
      <div className="md:hidden space-y-3">
        {standards.map((standard) => {
          const stdNumber = standard.standard_number || standard.is_number;
          const isCurrent = standard.status?.toLowerCase().includes('current');

          return (
            <div
              key={standard.id}
              className="bg-white rounded-xl border border-[#243B53]/10 p-4 space-y-3 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[14px] font-bold text-[#0F766E] font-display">
                  {stdNumber}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    isCurrent
                      ? 'bg-emerald-50 text-[#16803C] border-emerald-300'
                      : 'bg-amber-50 text-[#D97706] border-amber-300'
                  }`}
                >
                  {standard.status}
                </span>
              </div>

              <div>
                <h3 className="text-[14px] font-medium text-[#102A43] leading-snug">
                  {standard.title}
                </h3>
                <p className="text-[12px] text-[#627D98] mt-1">
                  {standard.category} {standard.subcategory ? `→ ${standard.subcategory}` : ''}
                </p>
              </div>

              <div className="flex items-center justify-between text-[12px] text-[#627D98] pt-2 border-t border-[#243B53]/5">
                <span>Edition: <strong className="text-[#243B53]">{standard.edition_year || standard.edition || '—'}</strong></span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
                  BIS
                </span>
              </div>

              <Link
                to={`/standards/${encodeURIComponent(standard.id)}`}
                className="w-full mt-2 py-2 px-3 rounded-lg text-[13px] font-semibold text-[#0F766E] bg-[#0F766E]/5 hover:bg-[#0F766E] hover:text-white border border-[#0F766E]/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
