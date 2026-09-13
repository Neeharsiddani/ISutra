// ============================================================
// ISutra — Analysis History Page
// Phase 2: Displays previous procurement analysis records
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Search, ArrowRight, CheckCircle2, Clock, FileText, Plus } from 'lucide-react';
import { getAnalysisHistory } from '../services/api';
import type { AnalysisHistoryItem } from '../types';
import Button from '../components/ui/Button';

export default function AnalysisHistoryPage() {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    getAnalysisHistory()
      .then((data) => setHistory(data))
      .catch((err) => console.error('Error fetching history:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredHistory = history.filter((item) => {
    const q = filterText.toLowerCase();
    return (
      item.product_name.toLowerCase().includes(q) ||
      item.short_description.toLowerCase().includes(q) ||
      item.input_type.toLowerCase().includes(q) ||
      item.analysis_id.toLowerCase().includes(q)
    );
  });

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getInputTypeLabel = (type: string) => {
    switch (type) {
      case 'product_description':
        return 'Product Description';
      case 'technical_specification':
        return 'Technical Specification';
      case 'tender_document':
        return 'Tender Document';
      default:
        return type;
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-teal" />
            Analysis History
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            View previously processed procurement specifications and extracted requirements.
          </p>
        </div>

        <Link to="/analyze">
          <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
            Start New Analysis
          </Button>
        </Link>
      </div>

      {/* Filter / Search bar */}
      <div className="bg-white p-3.5 rounded-xl border border-border flex items-center gap-3 shadow-2xs">
        <Search className="w-4 h-4 text-text-light shrink-0" />
        <input
          type="text"
          placeholder="Filter by product, specification keywords, or analysis ID..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full text-xs text-text-primary bg-transparent outline-hidden"
        />
        {filterText && (
          <button
            onClick={() => setFilterText('')}
            className="text-xs text-text-muted hover:text-text-primary"
          >
            Clear
          </button>
        )}
      </div>

      {/* History Records List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-text-muted">Loading analysis history...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center shadow-xs">
          <FileText className="w-12 h-12 text-text-light mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-text-primary">No Analysis Records Found</h3>
          <p className="text-xs text-text-muted mt-1 mb-6 max-w-sm mx-auto">
            {filterText
              ? 'No records matched your filter. Try adjusting your search keywords.'
              : 'You have not performed any procurement analyses yet. Enter a specification to get started.'}
          </p>
          <Link to="/analyze">
            <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
              Start a New Analysis
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-surface border-b border-border text-text-muted uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Input Type</th>
                  <th className="py-3 px-4">Product / Specification</th>
                  <th className="py-3 px-4">Parameters</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {filteredHistory.map((item) => (
                  <tr key={item.analysis_id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3.5 px-4 text-text-muted whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-text-light" />
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                      <span className="text-[10px] text-text-light block font-mono">
                        {item.analysis_id}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-surface border border-border text-[11px] font-medium text-text-primary">
                        {getInputTypeLabel(item.input_type)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <div className="font-semibold text-text-primary truncate">
                        {item.product_name}
                      </div>
                      <p className="text-[11px] text-text-muted truncate mt-0.5">
                        {item.short_description}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-text-muted">
                      <span className="font-semibold text-text-primary">{item.parameters_count}</span>{' '}
                      extracted
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.confirmed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Confirmed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal/10 text-teal border border-teal/20">
                          Extracted
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/analysis/${item.analysis_id}/review`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-teal hover:text-teal-dark hover:underline"
                      >
                        <span>View Analysis</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
