import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { StandardRelationship } from '../../types';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';

interface RelatedStandardsListProps {
  relationships: StandardRelationship[];
  title: string;
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  normative_reference: 'Normative Reference',
  test_method: 'Test Method',
  safety_standard: 'Safety Standard',
  installation_standard: 'Installation Standard',
  terminology: 'Terminology',
  related_product: 'Related Product',
  allied_standard: 'Allied Standard',
};

export default function RelatedStandardsList({
  relationships,
  title,
}: RelatedStandardsListProps) {
  if (relationships.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">{title}</h3>
        <EmptyState
          title={`No ${title.toLowerCase()} available`}
          description="Related standards will be populated with verified data in future phases."
        />
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-text-primary mb-3">{title}</h3>
      <div className="space-y-2">
        {relationships.map((rel) => (
          <div
            key={rel.id}
            className="flex items-center justify-between gap-3 px-4 py-3 bg-surface rounded-lg border border-border-light hover:border-border transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-xs font-bold text-teal">
                  {rel.target_standard?.is_number || 'Unknown'}
                </span>
                <Badge variant="default" size="sm">
                  {RELATIONSHIP_LABELS[rel.relationship_type] || rel.relationship_type}
                </Badge>
              </div>
              <p className="text-xs text-text-muted truncate">
                {rel.target_standard?.title || rel.description}
              </p>
            </div>
            {rel.target_standard && (
              <Link
                to={`/standards/${rel.target_standard.id}`}
                className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-teal hover:text-teal-dark transition-colors"
              >
                View
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
