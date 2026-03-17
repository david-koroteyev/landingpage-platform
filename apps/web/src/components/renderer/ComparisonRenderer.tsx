import type { ComparisonTableBlock } from '@lp/shared';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export function ComparisonRenderer({ block }: { block: ComparisonTableBlock }) {
  const { props } = block;

  return (
    <div className="py-16 px-6 md:px-12" style={{ backgroundColor: block.styles.backgroundColor }}>
      <div className="mx-auto max-w-4xl">
        {props.heading && <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">{props.heading}</h2>}
        {props.subheading && <p className="text-gray-500 text-center mb-10">{props.subheading}</p>}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Feature</th>
                {props.columns.map((col) => (
                  <th key={col.id} className={cn('px-6 py-4 text-sm font-semibold text-center', col.isHighlighted ? 'text-brand-700 bg-brand-50' : 'text-gray-700')}>
                    {col.isHighlighted && <div className="text-xs font-medium text-brand-600 mb-1">⭐ Recommended</div>}
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {props.rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-700">{row.feature}</td>
                  {props.columns.map((col) => {
                    const val = row.values[col.id];
                    return (
                      <td key={col.id} className={cn('px-6 py-3 text-center', col.isHighlighted && 'bg-brand-50/30')}>
                        {typeof val === 'boolean' ? (
                          val
                            ? <Check className="h-5 w-5 text-green-500 mx-auto" />
                            : <X className="h-5 w-5 text-gray-300 mx-auto" />
                        ) : (
                          <span className="text-sm text-gray-600">{val}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
