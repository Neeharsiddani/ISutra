import { Link } from 'react-router-dom';
import { ArrowRight, Lightbulb } from 'lucide-react';
import type { Recommendation } from '../../types';
import { StatusBadge } from '../ui/Badge';
import Badge from '../ui/Badge';
import RelevanceScore from './RelevanceScore';
import Card from '../ui/Card';

interface StandardCardProps {
  recommendation: Recommendation;
}

const categoryLabels: Record<string, string> = {
  recommended: 'Recommended',
  related: 'Related / Allied',
  normative_reference: 'Normative Reference',
  testing: 'Testing Standard',
  safety: 'Safety Standard',
  installation: 'Installation Standard',
  certification: 'Certification',
};

export default function StandardCard({ recommendation }: StandardCardProps) {
  const standard = recommendation.standard;
  if (!standard) return null;

  return (
    <Card hover className="animate-slide-up">
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold text-teal tracking-wide">
                {standard.is_number}
              </span>
              <StatusBadge status={standard.status} />
              <Badge variant="saffron" size="sm">
                {categoryLabels[recommendation.category] || recommendation.category}
              </Badge>
            </div>
            <h3 className="text-sm font-semibold text-text-primary leading-snug">
              {standard.title}
            </h3>
          </div>
          <div className="shrink-0 text-right">
            <RelevanceScore score={recommendation.relevance_score} size="sm" />
          </div>
        </div>

        {/* Reason */}
        <div className="flex items-start gap-2 px-3 py-2.5 bg-surface rounded-md">
          <Lightbulb className="w-3.5 h-3.5 text-saffron shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-semibold text-saffron-dark uppercase tracking-wider">
              Why this standard?
            </span>
            <p className="text-xs text-text-muted leading-relaxed mt-0.5">
              {recommendation.reason}
            </p>
          </div>
        </div>

        {/* Meta + Action */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3 text-[11px] text-text-light">
            <span>{standard.edition}</span>
            <span>·</span>
            <span>{standard.category}</span>
          </div>
          <Link
            to={`/standards/${standard.id}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-teal hover:text-teal-dark transition-colors"
          >
            View Details
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
