import { Link } from 'react-router-dom';
import {
  FileText,
  Cpu,
  Search,
  CheckCircle,
  ArrowRight,
  Database,
  Globe,
  Layers,
  Zap,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="mb-10 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
          How It Works
        </h1>
        <p className="text-sm text-text-muted max-w-xl mx-auto">
          A step-by-step overview of how the IS Standards AI engine analyzes
          procurement specifications and recommends applicable Indian Standards.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-6 mb-16">
        <StepCard
          step={1}
          icon={<FileText className="w-6 h-6" />}
          title="Input Your Specification"
          description="You can provide procurement specifications in three ways:"
          details={[
            'Enter a product description — describe the product being procured',
            'Paste technical specifications — include detailed technical parameters',
            'Upload a tender document — PDF, DOC, or DOCX files are supported',
          ]}
        />
        <StepCard
          step={2}
          icon={<Cpu className="w-6 h-6" />}
          title="AI Analysis & Processing"
          description="The engine processes your specification using advanced techniques:"
          details={[
            'Natural Language Processing (NLP) extracts key requirements',
            'Technical parameters and product categories are identified',
            'Entity recognition identifies specific product types and attributes',
            'Semantic understanding captures the intent of the specification',
          ]}
          badge="Planned — Phase 2-3"
        />
        <StepCard
          step={3}
          icon={<Search className="w-6 h-6" />}
          title="Standards Matching"
          description="Extracted requirements are matched against the Indian Standards database:"
          details={[
            'Semantic search finds standards with matching scope and requirements',
            'Relevance scoring ranks standards by applicability',
            'Each recommendation includes an explanation of why it was selected',
            'Related and allied standards are identified through the relationship graph',
          ]}
          badge="Planned — Phase 3"
        />
        <StepCard
          step={4}
          icon={<CheckCircle className="w-6 h-6" />}
          title="Comprehensive Results"
          description="You receive a complete package of standards information:"
          details={[
            'Ranked list of recommended Indian Standards with relevance scores',
            'Allied and normative reference standards',
            'Test methods and safety standards',
            'Installation requirements',
            'Applicable certification requirements (BIS, CRS, Hallmarking)',
            'Latest version and amendment information',
          ]}
        />
      </div>

      {/* Architecture */}
      <div className="mb-16">
        <h2 className="text-xl font-bold text-text-primary mb-6 text-center">
          Platform Architecture
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ArchCard
            icon={<Layers className="w-5 h-5" />}
            title="Standards Database"
            description="Structured PostgreSQL database storing Indian Standards metadata, relationships, amendments, and certification requirements."
          />
          <ArchCard
            icon={<Cpu className="w-5 h-5" />}
            title="AI/NLP Engine"
            description="Natural language processing pipeline for extracting technical requirements from procurement specifications."
            planned
          />
          <ArchCard
            icon={<Database className="w-5 h-5" />}
            title="Multi-Signal Matching"
            description="Explainable multi-signal matching using product, scope, application, environment, technical, and safety signals."
            planned
          />
          <ArchCard
            icon={<Zap className="w-5 h-5" />}
            title="Recommendation Engine"
            description="Intelligent ranking system that scores and explains standards relevance based on specification analysis."
            planned
          />
          <ArchCard
            icon={<FileText className="w-5 h-5" />}
            title="Document Processing"
            description="PDF and DOCX processing pipeline for extracting specifications from tender documents."
            planned
          />
          <ArchCard
            icon={<Globe className="w-5 h-5" />}
            title="Multilingual Support"
            description="Support for procurement specifications in multiple Indian languages with NLP-based translation."
            planned
          />
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link to="/dashboard">
          <Button size="lg" icon={<ArrowRight className="w-4 h-4" />}>
            Try It Now
          </Button>
        </Link>
      </div>
    </div>
  );
}

// --- Sub-components ---

function StepCard({
  step,
  icon,
  title,
  description,
  details,
  badge,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
  badge?: string;
}) {
  return (
    <Card hover padding="lg">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center text-teal relative">
            {icon}
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-navy text-white text-[10px] font-bold flex items-center justify-center">
              {step}
            </span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h3 className="text-base font-semibold text-text-primary">
              {title}
            </h3>
            {badge && <Badge variant="saffron" size="sm">{badge}</Badge>}
          </div>
          <p className="text-sm text-text-muted mb-3">{description}</p>
          <ul className="space-y-1.5">
            {details.map((detail, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-text-muted">
                <div className="w-1.5 h-1.5 rounded-full bg-teal shrink-0 mt-1.5" />
                {detail}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

function ArchCard({
  icon,
  title,
  description,
  planned = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  planned?: boolean;
}) {
  return (
    <div
      className={`p-5 rounded-xl border ${
        planned
          ? 'border-dashed border-border bg-surface/50'
          : 'border-border bg-card'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="text-teal">{icon}</div>
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        {planned && <Badge variant="saffron" size="sm">Planned</Badge>}
      </div>
      <p className="text-xs text-text-muted leading-relaxed">{description}</p>
    </div>
  );
}
