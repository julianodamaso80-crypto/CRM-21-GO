import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-dark-500/30 bg-dark-700/50 backdrop-blur-sm p-6 transition-all duration-300 ${
        hover
          ? 'hover:shadow-lg hover:shadow-blue-500/5 hover:border-dark-400/50 hover:-translate-y-1'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
