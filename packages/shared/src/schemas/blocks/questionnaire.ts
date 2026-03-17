import { z } from 'zod';

const questionOptionSchema = z.object({
  id: z.string(),
  label: z.string().min(1).max(200),
  value: z.string().max(200),
});

const questionSchema = z.object({
  id: z.string(),
  type: z.enum(['single_choice', 'multiple_choice', 'text', 'rating', 'yes_no']),
  text: z.string().min(1).max(500),
  required: z.boolean(),
  options: z.array(questionOptionSchema).max(20).optional(),
  minRating: z.number().min(1).max(10).optional(),
  maxRating: z.number().min(1).max(10).optional(),
});

export const questionnaireBlockPropsSchema = z.object({
  heading: z.string().max(300).optional(),
  subheading: z.string().max(500).optional(),
  questions: z.array(questionSchema).max(20),
  submitLabel: z.string().max(100).optional(),
  successMessage: z.string().max(500).optional(),
  webhookUrl: z.string().url().optional().or(z.literal('')),
});
