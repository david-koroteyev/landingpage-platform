import { z } from 'zod';

export const heroBlockPropsSchema = z.object({
  headline: z.string().min(1).max(300),
  subheadline: z.string().max(500).optional(),
  ctaLabel: z.string().max(100).optional(),
  ctaHref: z.string().max(500).optional(),
  ctaVariant: z.enum(['primary', 'secondary', 'ghost']).optional(),
  secondaryCtaLabel: z.string().max(100).optional(),
  secondaryCtaHref: z.string().max(500).optional(),
  backgroundImage: z.string().url().optional().or(z.literal('')),
  backgroundOverlay: z.boolean().optional(),
  alignment: z.enum(['left', 'center', 'right']).optional(),
  minHeight: z.string().max(20).optional(),
});
