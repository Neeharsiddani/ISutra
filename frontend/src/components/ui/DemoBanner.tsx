import { AlertTriangle } from 'lucide-react';
import { DEMO_NOTICE } from '../../data/demoData';

interface DemoBannerProps {
  compact?: boolean;
  message?: string;
}

export default function DemoBanner({ compact = false, message }: DemoBannerProps) {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-saffron/10 border border-saffron/25 rounded-md">
        <AlertTriangle className="w-3.5 h-3.5 text-saffron-dark shrink-0" />
        <span className="text-[11px] font-medium text-saffron-dark">
          {message || 'Demo Data — Not Official'}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-saffron/8 border border-saffron/20 rounded-lg px-4 py-3 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-saffron-dark shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold text-saffron-dark mb-0.5">
          Demo Data — Not Official Standards Information
        </p>
        <p className="text-[11px] text-saffron-dark/70 leading-relaxed">
          {message || DEMO_NOTICE}
        </p>
      </div>
    </div>
  );
}
