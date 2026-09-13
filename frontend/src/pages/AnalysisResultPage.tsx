import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import type { Recommendation } from '../types';
import StandardCard from '../components/standards/StandardCard';
import DemoBanner from '../components/ui/DemoBanner';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

export default function AnalysisResultPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('analysisResult');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecommendations(parsed.recommendations || []);
        setIsDemo(parsed.isDemo || false);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  if (recommendations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          title="No analysis performed yet"
          description="Go to the Dashboard to enter a procurement specification and run an analysis."
          icon={<BarChart3 className="w-7 h-7 text-text-light" />}
        />
        <div className="text-center mt-4">
          <Link to="/dashboard">
            <Button variant="primary">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Group recommendations by category
  const recommended = recommendations.filter((r) => r.category === 'recommended');
  const related = recommendations.filter((r) => r.category === 'related');
  const safety = recommendations.filter((r) => r.category === 'safety');
  const testing = recommendations.filter((r) => r.category === 'testing');
  const installation = recommendations.filter((r) => r.category === 'installation');
  const normative = recommendations.filter((r) => r.category === 'normative_reference');
  const certification = recommendations.filter((r) => r.category === 'certification');

  const sections: { title: string; items: Recommendation[] }[] = [
    { title: 'Recommended Standards', items: recommended },
    { title: 'Related / Allied Standards', items: related },
    { title: 'Safety Standards', items: safety },
    { title: 'Testing Standards', items: testing },
    { title: 'Installation Standards', items: installation },
    { title: 'Normative References', items: normative },
    { title: 'Certification Requirements', items: certification },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/dashboard"
          className="p-2 rounded-md text-text-muted hover:bg-surface hover:text-text-primary transition-colors"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Recommended Indian Standards
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            {recommendations.length} standard{recommendations.length !== 1 ? 's' : ''}{' '}
            identified
          </p>
        </div>
      </div>

      {/* Demo Banner */}
      {isDemo && (
        <div className="mb-6">
          <DemoBanner />
        </div>
      )}

      {/* Result Sections */}
      <div className="space-y-10">
        {sections.map((section) => {
          if (section.items.length === 0) {
            return (
              <div key={section.title}>
                <h2 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                  {section.title}
                  <span className="text-xs font-normal text-text-light">
                    (0)
                  </span>
                </h2>
                <div className="bg-card rounded-lg border border-border-light px-4 py-6 text-center">
                  <p className="text-xs text-text-muted">
                    No {section.title.toLowerCase()} found for this specification.
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div key={section.title}>
              <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
                {section.title}
                <span className="text-xs font-normal bg-teal/10 text-teal px-2 py-0.5 rounded-full">
                  {section.items.length}
                </span>
              </h2>
              <div className="space-y-4">
                {section.items.map((rec) => (
                  <StandardCard key={rec.id} recommendation={rec} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Back Action */}
      <div className="mt-10 pt-6 border-t border-border-light text-center">
        <Link to="/dashboard">
          <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
            New Analysis
          </Button>
        </Link>
      </div>
    </div>
  );
}
