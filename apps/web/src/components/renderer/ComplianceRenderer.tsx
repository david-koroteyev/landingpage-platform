import type { ComplianceBlock } from '@lp/shared';
import { cn } from '@/lib/cn';

export function ComplianceRenderer({ block }: { block: ComplianceBlock }) {
  const { props } = block;
  const variantClass = {
    subtle: 'text-gray-400 text-xs py-6 px-6 text-center',
    bordered: 'border-t border-gray-200 text-gray-500 text-sm py-6 px-6',
    prominent: 'bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm p-4 mx-6 my-6',
  }[props.variant || 'subtle'];

  return (
    <div style={{ backgroundColor: block.styles.backgroundColor }}>
      <p className={cn('leading-relaxed max-w-4xl mx-auto', variantClass)}>
        {props.text}
      </p>
    </div>
  );
}
