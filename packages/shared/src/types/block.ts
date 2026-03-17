import type { HeroBlockProps } from './blocks/hero';
import type { TextImageBlockProps } from './blocks/text-image';
import type { FaqBlockProps } from './blocks/faq';
import type { QuestionnaireBlockProps } from './blocks/questionnaire';
import type { FormBlockProps } from './blocks/form';
import type { TestimonialBlockProps } from './blocks/testimonial';
import type { CtaBlockProps } from './blocks/cta';
import type { CountdownBlockProps } from './blocks/countdown';
import type { ComparisonTableBlockProps } from './blocks/comparison';
import type { ComplianceBlockProps } from './blocks/compliance';

export type { HeroBlockProps, TextImageBlockProps, FaqBlockProps, QuestionnaireBlockProps,
  FormBlockProps, TestimonialBlockProps, CtaBlockProps, CountdownBlockProps,
  ComparisonTableBlockProps, ComplianceBlockProps };

export type BlockType =
  | 'hero'
  | 'text_image'
  | 'faq'
  | 'questionnaire'
  | 'form'
  | 'testimonial'
  | 'cta'
  | 'countdown'
  | 'comparison_table'
  | 'compliance';

export interface BlockStyles {
  backgroundColor?: string;
  textColor?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  customCss?: string;
}

export interface BlockBase {
  id: string;
  type: BlockType;
  order: number;
  locked: boolean;   // brand/compliance lock — cannot be moved or deleted
  visible: boolean;
  styles: BlockStyles;
}

export interface HeroBlock extends BlockBase { type: 'hero'; props: HeroBlockProps }
export interface TextImageBlock extends BlockBase { type: 'text_image'; props: TextImageBlockProps }
export interface FaqBlock extends BlockBase { type: 'faq'; props: FaqBlockProps }
export interface QuestionnaireBlock extends BlockBase { type: 'questionnaire'; props: QuestionnaireBlockProps }
export interface FormBlock extends BlockBase { type: 'form'; props: FormBlockProps }
export interface TestimonialBlock extends BlockBase { type: 'testimonial'; props: TestimonialBlockProps }
export interface CtaBlock extends BlockBase { type: 'cta'; props: CtaBlockProps }
export interface CountdownBlock extends BlockBase { type: 'countdown'; props: CountdownBlockProps }
export interface ComparisonTableBlock extends BlockBase { type: 'comparison_table'; props: ComparisonTableBlockProps }
export interface ComplianceBlock extends BlockBase { type: 'compliance'; props: ComplianceBlockProps }

export type Block =
  | HeroBlock
  | TextImageBlock
  | FaqBlock
  | QuestionnaireBlock
  | FormBlock
  | TestimonialBlock
  | CtaBlock
  | CountdownBlock
  | ComparisonTableBlock
  | ComplianceBlock;

// Helper to get the props type for a given block type
export type BlockPropsMap = {
  hero: HeroBlockProps;
  text_image: TextImageBlockProps;
  faq: FaqBlockProps;
  questionnaire: QuestionnaireBlockProps;
  form: FormBlockProps;
  testimonial: TestimonialBlockProps;
  cta: CtaBlockProps;
  countdown: CountdownBlockProps;
  comparison_table: ComparisonTableBlockProps;
  compliance: ComplianceBlockProps;
};
