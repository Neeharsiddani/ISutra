import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export default function Card({
  children,
  hover = false,
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-card rounded-lg border border-border shadow-card ${
        hover ? 'transition-shadow duration-200 hover:shadow-card-hover' : ''
      } ${paddingMap[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
