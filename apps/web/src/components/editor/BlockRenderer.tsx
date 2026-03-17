'use client';

import type { Block } from '@lp/shared';
import { HeroRenderer } from '../renderer/HeroRenderer';
import { FaqRenderer } from '../renderer/FaqRenderer';
import { QuestionnaireRenderer } from '../renderer/QuestionnaireRenderer';
import { FormRenderer } from '../renderer/FormRenderer';
import { TestimonialRenderer } from '../renderer/TestimonialRenderer';
import { CtaRenderer } from '../renderer/CtaRenderer';
import { CountdownRenderer } from '../renderer/CountdownRenderer';
import { ComparisonRenderer } from '../renderer/ComparisonRenderer';
import { ComplianceRenderer } from '../renderer/ComplianceRenderer';
import { TextImageRenderer } from '../renderer/TextImageRenderer';

interface BlockRendererProps {
  block: Block;
  isPreview?: boolean;
}

export function BlockRenderer({ block, isPreview = false }: BlockRendererProps) {
  switch (block.type) {
    case 'hero':
      return <HeroRenderer block={block} />;
    case 'text_image':
      return <TextImageRenderer block={block} />;
    case 'faq':
      return <FaqRenderer block={block} />;
    case 'questionnaire':
      return <QuestionnaireRenderer block={block} isPreview={isPreview} />;
    case 'form':
      return <FormRenderer block={block} isPreview={isPreview} />;
    case 'testimonial':
      return <TestimonialRenderer block={block} />;
    case 'cta':
      return <CtaRenderer block={block} />;
    case 'countdown':
      return <CountdownRenderer block={block} />;
    case 'comparison_table':
      return <ComparisonRenderer block={block} />;
    case 'compliance':
      return <ComplianceRenderer block={block} />;
    default:
      return (
        <div className="p-4 text-center text-sm text-gray-400">
          Unknown block type: {(block as Block).type}
        </div>
      );
  }
}
