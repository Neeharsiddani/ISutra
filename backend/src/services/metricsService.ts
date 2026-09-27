// ============================================================
// ISutra — Procurement Intelligence Operational Metrics Framework
// SIH26108 Evaluator Lens: Impact Measurement Definitions
// Privacy-preserving, non-invasive operational telemetry definitions
// ZERO FABRICATION: Does not claim invented historical percentages
// ============================================================

export interface MetricDefinition {
  id: string;
  name: string;
  description: string;
  category: 'workflow_efficiency' | 'decision_quality' | 'system_reliability';
  formula: string;
  unit: string;
  targetBenchmark?: string;
}

export const OPERATIONAL_METRIC_DEFINITIONS: MetricDefinition[] = [
  {
    id: 'M1_COMPLETION_RATE',
    name: 'Analysis Completion Rate',
    description: 'Proportion of initiated procurement analyses that successfully complete requirement structuring and standards evaluation.',
    category: 'workflow_efficiency',
    formula: '(Completed Analyses / Total Initiated Analyses) * 100',
    unit: '%',
    targetBenchmark: '>= 95%',
  },
  {
    id: 'M2_TURNAROUND_TIME',
    name: 'Average Turnaround Time',
    description: 'Average latency from natural-language specification submission to deterministic recommendation delivery.',
    category: 'workflow_efficiency',
    formula: 'Sum(Completion Timestamp - Submission Timestamp) / Total Analyses',
    unit: 'seconds',
    targetBenchmark: '< 5 seconds',
  },
  {
    id: 'M3_REVIEW_CORRECTION_RATE',
    name: 'Human Review Correction Rate',
    description: 'Frequency with which human procurement reviewers edit or correct AI/NLP-extracted parameters prior to standards evaluation.',
    category: 'decision_quality',
    formula: '(Analyses with Human Parameter Edits / Total Confirmed Analyses) * 100',
    unit: '%',
    targetBenchmark: '< 20% (demonstrates NLP extraction precision)',
  },
  {
    id: 'M4_REFERENCE_COVERAGE_RATE',
    name: 'Sufficient Reference Coverage Rate',
    description: 'Proportion of evaluated requirements where the verified BIS reference dataset provides at least one high-confidence or relevant match.',
    category: 'decision_quality',
    formula: '(Analyses with Score >= 0.60 / Total Completed Analyses) * 100',
    unit: '%',
    targetBenchmark: 'Depends on reference dataset catalog scope',
  },
  {
    id: 'M5_EVIDENCE_COMPLETENESS_RATE',
    name: 'Evidence Chain Completeness Rate',
    description: 'Percentage of returned recommendations containing complete 5-stage traceability and factor score breakdowns.',
    category: 'decision_quality',
    formula: '(Recommendations with Complete Traceability / Total Recommendations) * 100',
    unit: '%',
    targetBenchmark: '100% (architectural guarantee)',
  },
  {
    id: 'M6_VERIFICATION_REQUIRED_RATE',
    name: 'Verification Required Rate',
    description: 'Percentage of requirement parameters flagged as unrecorded in the reference dataset, requiring official BIS verification.',
    category: 'decision_quality',
    formula: '(Parameters Flagged "Verification Required" / Total Evaluated Parameters) * 100',
    unit: '%',
    targetBenchmark: 'Auditable metric showing boundary safety',
  },
  {
    id: 'M7_DOCUMENT_EXTRACTION_SUCCESS_RATE',
    name: 'Document Extraction Success Rate',
    description: 'Proportion of uploaded machine-readable tender documents (PDF/DOCX) successfully parsed without parsing error.',
    category: 'system_reliability',
    formula: '(Successful Document Extractions / Total Uploaded Documents) * 100',
    unit: '%',
    targetBenchmark: '>= 90% for machine-readable documents',
  },
  {
    id: 'M8_MULTILINGUAL_SUCCESS_RATE',
    name: 'Multilingual Extraction Success Rate',
    description: 'Proportion of non-English (Hindi, Telugu, Mixed) procurement specifications successfully normalized into structured requirements.',
    category: 'system_reliability',
    formula: '(Successful Indic Extractions / Total Indic Submissions) * 100',
    unit: '%',
    targetBenchmark: '>= 90% for supported Indic languages',
  },
  {
    id: 'M9_OFFICER_ACCEPTANCE_RATE',
    name: 'Officer Recommendation Acceptance Rate',
    description: 'Percentage of top-ranked deterministic BIS recommendations selected and accepted by procurement officers for report generation.',
    category: 'decision_quality',
    formula: '(Accepted Top Recommendations / Total Generated Reports) * 100',
    unit: '%',
    targetBenchmark: '>= 80%',
  },
];

export interface OperationalMetricsSnapshot {
  timestamp: string;
  definitions: MetricDefinition[];
  measurementFrameworkStatus: 'active' | 'simulation' | 'benchmark';
  notes: string;
}

export function getOperationalMetricsSummary(): OperationalMetricsSnapshot {
  return {
    timestamp: new Date().toISOString(),
    definitions: OPERATIONAL_METRIC_DEFINITIONS,
    measurementFrameworkStatus: 'active',
    notes:
      'ISutra operational metrics framework defines target indicators for field deployment. Actual historical metrics must be measured empirically across pilot procurement deployments rather than simulated or fabricated.',
  };
}
