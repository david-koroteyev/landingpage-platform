import { z } from 'zod';

export const faqItemSchema = z.object({
  id: z.string(),
  question: z.string().min(1).max(500),
  answer: z.string().min(1).max(5000),
});

export const faqBlockPropsSchema = z.object({
  heading: z.string().max(300).optional(),
  subheading: z.string().max(500).optional(),
  items: z.array(faqItemSchema).max(50),
});
