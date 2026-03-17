'use client';

import { useState } from 'react';
import type { FaqBlock } from '@lp/shared';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export function FaqRenderer({ block }: { block: FaqBlock }) {
  const { props } = block;
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="py-16 px-6 md:px-12" style={{ backgroundColor: block.styles.backgroundColor }}>
      <div className="mx-auto max-w-3xl">
        {props.heading && (
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{props.heading}</h2>
        )}
        {props.subheading && (
          <p className="text-gray-500 mb-8">{props.subheading}</p>
        )}
        <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 overflow-hidden">
          {props.items.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id}>
                <button
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{item.question}</span>
                  <ChevronDown className={cn('h-4 w-4 text-gray-500 transition-transform shrink-0 ml-4', isOpen && 'rotate-180')} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
