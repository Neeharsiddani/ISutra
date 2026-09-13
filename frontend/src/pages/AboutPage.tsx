// ============================================================
// ISutra — About Page
// ============================================================

import { Target, Shield, Layers } from 'lucide-react';
import Card from '../components/ui/Card';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
          About ISutra
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          AI-Powered Indian Standards Intelligence — Know the Standard. Specify with Confidence.
        </p>
      </div>

      {/* Problem Statement */}
      <Card padding="lg">
        <div className="flex items-start gap-3 mb-3">
          <Target className="w-5 h-5 text-teal shrink-0 mt-0.5" />
          <h2 className="text-base font-bold text-text-primary">
            Problem Statement & Context
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-3">
          Government departments, Public Sector Enterprises (PSUs), procurement
          agencies, and private organizations frequently need to identify
          applicable Indian Standards (IS) when preparing procurement
          specifications and tender documents.
        </p>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
          Currently, procurement officials must search manually through thousands of standards to find applicable ones, identify normative references, check for latest amendments, and determine certification requirements. ISutra automates this workflow with an intelligent requirement understanding layer and semantic standards recommendation.
        </p>
      </Card>

      {/* Objectives */}
      <Card padding="lg">
        <div className="flex items-start gap-3 mb-3">
          <Shield className="w-5 h-5 text-teal shrink-0 mt-0.5" />
          <h2 className="text-base font-bold text-text-primary">
            Key Platform Capabilities
          </h2>
        </div>
        <ul className="space-y-2.5">
          {[
            'Extract structured technical requirements from specifications with provenance tracking',
            'Identify key equipment parameters, operating environments, and installation constraints',
            'Detect missing information and generate dynamic clarification questions',
            'Provide human-in-the-loop verification and editing for procurement officers',
            'Maintain audit trails and analysis history for tender compliance',
            'Phase 3 preparation: semantic matching against the Indian Standards Knowledge Base',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-text-muted">
              <div className="w-1.5 h-1.5 rounded-full bg-teal shrink-0 mt-1.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Current Phase Notice */}
      <Card padding="lg">
        <div className="flex items-start gap-3 mb-2">
          <Layers className="w-5 h-5 text-teal shrink-0 mt-0.5" />
          <h2 className="text-base font-bold text-text-primary">
            Phase 2 Scope & Disclaimer
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-2">
          ISutra is in <strong>Phase 2 (AI Requirement Understanding)</strong>. In this phase, the system extracts, validates, and stores procurement requirements. It strictly does not invent Indian Standards or claim to provide official recommendations.
        </p>
        <p className="text-[11px] text-text-light">
          Smart India Hackathon (SIH) Prototype • Not an official service of the Bureau of Indian Standards (BIS).
        </p>
      </Card>
    </div>
  );
}
