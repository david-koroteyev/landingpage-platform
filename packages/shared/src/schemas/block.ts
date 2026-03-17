import { z } from 'zod';
import { heroBlockPropsSchema } from './blocks/hero';
import { faqBlockPropsSchema } from './blocks/faq';
import { questionnaireBlockPropsSchema } from './blocks/questionnaire';
import { formBlockPropsSchema } from './blocks/form';
import {
  textImageBlockPropsSchema,
  testimonialBlockPropsSchema,
  ctaBlockPropsSchema,
  countdownBlockPropsSchema,
  comparisonTableBlockPropsSchema,
  complianceBlockPropsSchema,
} from './blocks/other';

export const blockStylesSchema = z.object({
  backgroundColor: z.string().max(50).optional(),
  textColor: z.string().max(50).optional(),
  paddingTop: z.string().max(20).optional(),
  paddingBottom: z.string().max(20).optional(),
  paddingLeft: z.string().max(20).optional(),
  paddingRight: z.string().max(20).optional(),
  customCss: z.string().max(5000).optional(),
});

const blockBaseSchema = z.object({
  id: z.string().uuid(),
  order: z.number().int().min(0),
  locked: z.boolean(),
  visible: z.boolean(),
  styles: blockStylesSchema,
});

export const blockSchema = z.discriminatedUnion('type', [
  blockBaseSchema.extend({ type: z.literal('hero'), props: heroBlockPropsSchema }),
  blockBaseSchema.extend({ type: z.literal('text_image'), props: textImageBlockPropsSchema }),
  blockBaseSchema.extend({ type: z.literal('faq'), props: faqBlockPropsSchema }),
  blockBaseSchema.extend({ type: z.literal('questionnaire'), props: questionnaireBlockPropsSchema }),
  blockBaseSchema.extend({ type: z.literal('form'), props: formBlockPropsSchema }),
  blockBaseSchema.extend({ type: z.literal('testimonial'), props: testimonialBlockPropsSchema }),
  blockBaseSchema.extend({ type: z.literal('cta'), props: ctaBlockPropsSchema }),
  blockBaseSchema.extend({ type: z.literal('countdown'), props: countdownBlockPropsSchema }),
  blockBaseSchema.extend({ type: z.literal('comparison_table'), props: comparisonTableBlockPropsSchema }),
  blockBaseSchema.extend({ type: z.literal('compliance'), props: complianceBlockPropsSchema }),
]);

export type BlockSchemaType = z.infer<typeof blockSchema>;
