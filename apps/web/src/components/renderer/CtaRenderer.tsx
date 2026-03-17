import type { CtaBlock } from '@lp/shared';
import { cn } from '@/lib/cn';

export function CtaRenderer({ block }: { block: CtaBlock }) {
  const { props } = block;
  const bgClass = {
    branded: 'bg-blue-600 text-white',
    dark: 'bg-gray-900 text-white',
    default: 'bg-white text-gray-900 border border-gray-200',
  }[props.backgroundStyle || 'branded'];

  return (
    <div className={cn('py-20 px-6 text-center', bgClass)} style={{ backgroundColor: block.styles.backgroundColor }}>
      <div className="mx-auto max-w-2xl">
        <h2 className="text-3xl font-bold mb-3">{props.heading}</h2>
        {props.subheading && <p className="text-lg opacity-85 mb-8">{props.subheading}</p>}
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={props.primaryHref}
            className={cn(
              'inline-flex items-center justify-center rounded-lg px-8 py-3.5 text-base font-semibold shadow transition-colors',
              props.backgroundStyle === 'branded' || props.backgroundStyle === 'dark'
                ? 'bg-white text-gray-900 hover:bg-gray-100'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            {props.primaryLabel}
          </a>
          {props.secondaryLabel && (
            <a
              href={props.secondaryHref || '#'}
              className={cn(
                'inline-flex items-center justify-center rounded-lg border-2 px-8 py-3.5 text-base font-semibold transition-colors',
                props.backgroundStyle === 'branded' || props.backgroundStyle === 'dark'
                  ? 'border-white/50 text-white hover:border-white'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              )}
            >
              {props.secondaryLabel}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
