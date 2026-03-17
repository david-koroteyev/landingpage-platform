import { z } from 'zod';

const formFieldSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'hidden']),
  label: z.string().min(1).max(200),
  placeholder: z.string().max(200).optional(),
  required: z.boolean(),
  options: z.array(z.string().max(200)).max(50).optional(),
  defaultValue: z.string().max(500).optional(),
});

export const formBlockPropsSchema = z.object({
  heading: z.string().max(300).optional(),
  subheading: z.string().max(500).optional(),
  fields: z.array(formFieldSchema).min(1).max(30),
  submitLabel: z.string().min(1).max(100),
  successMessage: z.string().max(500).optional(),
  webhookUrl: z.string().url().optional().or(z.literal('')),
  redirectUrl: z.string().url().optional().or(z.literal('')),
});
