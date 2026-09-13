import { Shield, ExternalLink } from 'lucide-react';
import type { Certification } from '../../types';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';

interface CertificationCardProps {
  certifications: Certification[];
}

const CERT_TYPE_VARIANT: Record<string, 'info' | 'success' | 'warning' | 'saffron'> = {
  'BIS Product Certification': 'info',
  CRS: 'success',
  Hallmarking: 'saffron',
  Other: 'default' as 'info',
};

export default function CertificationCard({ certifications }: CertificationCardProps) {
  if (certifications.length === 0) {
    return (
      <EmptyState
        title="No certification information available"
        description="Certification requirements will be populated with verified data in future phases."
        icon={<Shield className="w-7 h-7 text-text-light" />}
      />
    );
  }

  return (
    <div className="space-y-3">
      {certifications.map((cert) => (
        <div
          key={cert.id}
          className="px-4 py-3 bg-surface rounded-lg border border-border-light"
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-teal" />
            <Badge variant={CERT_TYPE_VARIANT[cert.certification_type] || 'info'}>
              {cert.certification_type}
            </Badge>
          </div>
          <p className="text-sm font-medium text-text-primary mb-1">
            {cert.requirement}
          </p>
          <p className="text-xs text-text-muted leading-relaxed">
            {cert.description}
          </p>
          {cert.source_url && (
            <a
              href={cert.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-teal hover:text-teal-dark mt-2 transition-colors"
            >
              View Source
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
