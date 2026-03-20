import { Badge } from './Badge';

interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
}

export function SectionHeading({
  badge,
  title,
  subtitle,
  align = 'center',
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col gap-4 ${alignClass} mb-12`}>
      {badge && (
        <Badge variant="orange">{badge}</Badge>
      )}

      <h2 className="font-display text-3xl font-bold text-dark-50 sm:text-4xl lg:text-5xl tracking-tight">
        {title}
      </h2>

      {/* Decorative line */}
      <div
        className={`h-1 w-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 ${
          align === 'center' ? 'mx-auto' : ''
        }`}
      />

      {subtitle && (
        <p className="max-w-2xl text-base text-dark-200 sm:text-lg leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
