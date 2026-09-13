interface RelevanceScoreProps {
  score: number;
  size?: 'sm' | 'md';
}

export default function RelevanceScore({ score, size = 'md' }: RelevanceScoreProps) {
  const percentage = Math.round(score * 100);
  const isHigh = percentage >= 80;
  const isMedium = percentage >= 60 && percentage < 80;

  const color = isHigh
    ? 'text-success'
    : isMedium
    ? 'text-saffron-dark'
    : 'text-text-muted';

  const barColor = isHigh
    ? 'bg-success'
    : isMedium
    ? 'bg-saffron'
    : 'bg-text-light';

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-16 h-1.5 bg-border-light rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={`text-[11px] font-semibold ${color}`}>
          {percentage}%
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-border-light rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`text-xs font-semibold ${color}`}>
        {percentage}% Relevance
      </span>
    </div>
  );
}
