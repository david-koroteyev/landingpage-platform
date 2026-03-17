import type { TestimonialBlock } from '@lp/shared';
import { Star } from 'lucide-react';

export function TestimonialRenderer({ block }: { block: TestimonialBlock }) {
  const { props } = block;

  return (
    <div className="py-16 px-6 md:px-12 bg-gray-50" style={{ backgroundColor: block.styles.backgroundColor || '#f9fafb' }}>
      <div className="mx-auto max-w-5xl">
        {props.heading && <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">{props.heading}</h2>}
        {props.subheading && <p className="text-gray-500 text-center mb-10">{props.subheading}</p>}

        <div className={`grid gap-6 ${props.items.length === 1 ? 'grid-cols-1 max-w-lg mx-auto' : props.items.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {props.items.map((item) => (
            <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              {item.rating && (
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < item.rating! ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
              )}
              <blockquote className="text-gray-700 text-sm leading-relaxed mb-4">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                {item.avatar ? (
                  <img src={item.avatar} alt={item.authorName} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700">
                    {item.authorName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.authorName}</p>
                  {(item.authorTitle || item.authorCompany) && (
                    <p className="text-xs text-gray-500">{[item.authorTitle, item.authorCompany].filter(Boolean).join(', ')}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
