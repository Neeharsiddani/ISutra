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
          Currently, procurement officials must search manually through thousands of standards to find applicable ones, identify normative references, check for published amendments, and determine relevant standards. ISutra streamlines this workflow with an intelligent requirement understanding layer and explainable standards recommendations.
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
            'Score standards using an explainable, deterministic multi-signal matching engine',
            'Provide 5-stage traceability from raw text to official BIS portal records',
            'Perform requirement gap analysis with conservative Reference Coverage metrics',
            'Side-by-side standards comparison workspace across 11 structured dimensions',
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
            Prototype Scope & Disclaimer
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-2">
          <strong>40 Verified BIS Reference Records:</strong> This prototype is not an exhaustive BIS catalogue. Recommendations are limited to the verified reference dataset. The matching and evidence model is designed to operate over a larger verified BIS catalogue when additional records are incorporated. ISutra uses AI to structure messy procurement requirements, then applies deterministic and evidence-backed standards analysis. The official BIS source remains the authority for final verification.
        </p>
        <p className="text-[11px] text-text-light">
          Smart India Hackathon (SIH) Prototype • 40 Verified BIS Reference Records • Not an official service of the Bureau of Indian Standards (BIS).
        </p>
      </Card>
    </div>
  );
}
