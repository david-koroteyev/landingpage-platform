import { cn } from '@/lib/cn';

type Variant = 'draft' | 'published' | 'archived' | 'default';

const variants: Record<Variant, string> = {
  draft: 'bg-gray-100 text-gray-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-red-100 text-red-600',
  default: 'bg-blue-100 text-blue-700',
};

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
