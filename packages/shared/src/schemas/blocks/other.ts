import { z } from 'zod';

export const textImageBlockPropsSchema = z.object({
  heading: z.string().max(300).optional(),
  body: z.string().max(10000),
  imageUrl: z.string().url().optional().or(z.literal('')),
  imageAlt: z.string().max(300).optional(),
  imagePosition: z.enum(['left', 'right']).optional(),
  ctaLabel: z.string().max(100).optional(),
  ctaHref: z.string().max(500).optional(),
});

export const testimonialItemSchema = z.object({
  id: z.string(),
  quote: z.string().min(1).max(2000),
  authorName: z.string().min(1).max(200),
  authorTitle: z.string().max(200).optional(),
  authorCompany: z.string().max(200).optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  rating: z.number().min(1).max(5).optional(),
});

export const testimonialBlockPropsSchema = z.object({
  heading: z.string().max(300).optional(),
  subheading: z.string().max(500).optional(),
  items: z.array(testimonialItemSchema).max(20),
  layout: z.enum(['grid', 'carousel', 'list']).optional(),
});

export const ctaBlockPropsSchema = z.object({
  heading: z.string().min(1).max(300),
  subheading: z.string().max(500).optional(),
  primaryLabel: z.string().min(1).max(100),
  primaryHref: z.string().max(500),
  secondaryLabel: z.string().max(100).optional(),
  secondaryHref: z.string().max(500).optional(),
  backgroundStyle: z.enum(['default', 'branded', 'dark']).optional(),
});

export const countdownBlockPropsSchema = z.object({
  heading: z.string().max(300).optional(),
  subheading: z.string().max(500).optional(),
  targetDate: z.string().datetime(),
  expiredMessage: z.string().max(500).optional(),
  ctaLabel: z.string().max(100).optional(),
  ctaHref: z.string().max(500).optional(),
  showDays: z.boolean().optional(),
  showHours: z.boolean().optional(),
  showMinutes: z.boolean().optional(),
  showSeconds: z.boolean().optional(),
});

export const comparisonTableBlockPropsSchema = z.object({
  heading: z.string().max(300).optional(),
  subheading: z.string().max(500).optional(),
  columns: z.array(z.object({ id: z.string(), label: z.string().max(200), isHighlighted: z.boolean().optional() })).max(10),
  rows: z.array(z.object({
    id: z.string(),
    feature: z.string().max(300),
    values: z.record(z.union([z.string(), z.boolean()])),
  })).max(30),
});

export const complianceBlockPropsSchema = z.object({
  text: z.string().min(1).max(5000),
  variant: z.enum(['subtle', 'bordered', 'prominent']).optional(),
});
