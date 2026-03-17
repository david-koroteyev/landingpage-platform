import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(200),
  inviteToken: z.string().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  password: z.string().min(8).max(100).optional(),
});
