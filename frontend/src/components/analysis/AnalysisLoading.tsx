// ============================================================
// ISutra — Analysis Loading State
// Real-time progress indicator for requirement extraction
// ============================================================

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

interface AnalysisLoadingProps {
  currentStage?: number;
}

const STEPS = [
  { id: 1, label: 'Reading specification' },
  { id: 2, label: 'Extracting product information' },
  { id: 3, label: 'Identifying technical requirements' },
];

export default function AnalysisLoading({ currentStage }: AnalysisLoadingProps) {
  const [internalStep, setInternalStep] = useState(1);

  useEffect(() => {
    if (currentStage !== undefined) {
      setInternalStep(currentStage);
      return;
    }

    const t1 = setTimeout(() => setInternalStep(2), 600);
    const t2 = setTimeout(() => setInternalStep(3), 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [currentStage]);

  const activeStep = currentStage !== undefined ? currentStage : internalStep;

  return (
    <div className="bg-white rounded-2xl border border-border p-8 sm:p-10 max-w-lg mx-auto shadow-xs text-center animate-fade-in">
      {/* Title */}
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0F766E]/10 text-[#0F766E] mb-3">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <h3 className="text-lg font-bold text-text-primary tracking-tight">
          Analyzing Procurement Specification...
        </h3>
        <p className="text-xs text-text-muted mt-1">
          ISutra AI Engine is processing text and extracting structured requirements...
        </p>
      </div>

      {/* Progress Steps */}
      <div className="space-y-3 text-left max-w-sm mx-auto mb-6">
        {STEPS.map((step) => {
          const isDone = activeStep > step.id;
          const isCurrent = activeStep === step.id;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
                isDone
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : isCurrent
                  ? 'bg-[#0F766E]/5 border-[#0F766E]/30 text-[#0F766E] shadow-2xs'
                  : 'bg-surface border-border text-text-light'
              }`}
            >
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-[#0F766E] animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-text-light/40" />
                )}
              </div>
              <span className={`text-xs ${isDone ? 'font-medium' : isCurrent ? 'font-semibold' : ''}`}>
                {step.label}
              </span>
              {isDone && (
                <span className="ml-auto text-[10px] text-emerald-700 font-semibold uppercase">
                  Done
                </span>
              )}
              {isCurrent && (
                <span className="ml-auto text-[10px] text-[#0F766E] font-semibold uppercase animate-pulse">
                  Processing
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-[11px] text-text-light">
        Evaluating technical parameters, application, and compliance dimensions.
      </div>
    </div>
  );
}
