interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingState({
  message = 'Loading...',
  size = 'md',
}: LoadingStateProps) {
  const sizeMap = {
    sm: { spinner: 'w-6 h-6', text: 'text-xs' },
    md: { spinner: 'w-10 h-10', text: 'text-sm' },
    lg: { spinner: 'w-14 h-14', text: 'text-base' },
  };

  const s = sizeMap[size];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 animate-fade-in">
      <div className={`${s.spinner} mb-4 relative`}>
        <div
          className={`${s.spinner} rounded-full border-[3px] border-border`}
        />
        <div
          className={`${s.spinner} rounded-full border-[3px] border-transparent border-t-teal animate-spin-slow absolute inset-0`}
        />
      </div>
      <p className={`${s.text} text-text-muted font-medium`}>{message}</p>
    </div>
  );
}

// Skeleton loader for cards
export function SkeletonCard() {
  return (
    <div className="bg-card rounded-lg border border-border p-5 animate-pulse">
      <div className="h-4 bg-border-light rounded w-1/3 mb-3" />
      <div className="h-3 bg-border-light rounded w-2/3 mb-2" />
      <div className="h-3 bg-border-light rounded w-1/2 mb-4" />
      <div className="flex gap-2">
        <div className="h-5 bg-border-light rounded-full w-16" />
        <div className="h-5 bg-border-light rounded-full w-20" />
      </div>
    </div>
  );
}
