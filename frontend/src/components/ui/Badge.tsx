import type { StandardStatus } from '../../types';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'demo' | 'saffron';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

const variantStyles = {
  default: 'bg-surface text-text-muted border-border',
  success: 'bg-success-light text-success border-success/20',
  warning: 'bg-warning-light text-warning border-warning/20',
  error: 'bg-error-light text-error border-error/20',
  info: 'bg-teal/10 text-teal border-teal/20',
  demo: 'bg-saffron/10 text-saffron-dark border-saffron/30',
  saffron: 'bg-saffron/10 text-saffron-dark border-saffron/30',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export default function Badge({ variant = 'default', children, size = 'md' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
}

// Helper: Convert StandardStatus to Badge variant
export function StatusBadge({ status }: { status: StandardStatus | string }) {
  const normalized = (status || '').toLowerCase();

  if (normalized.includes('current') || normalized.includes('active') || normalized.includes('verified')) {
    return <Badge variant="success">{status}</Badge>;
  }
  if (normalized.includes('revision') || normalized.includes('monitor') || normalized.includes('superseded')) {
    return <Badge variant="warning">{status}</Badge>;
  }
  if (normalized.includes('withdrawn')) {
    return <Badge variant="error">{status}</Badge>;
  }

  return <Badge variant="demo">{status || 'Unknown'}</Badge>;
}
