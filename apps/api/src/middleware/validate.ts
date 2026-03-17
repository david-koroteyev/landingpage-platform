import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const formatted = (result.error as ZodError).flatten();
      res.status(422).json({ error: 'Validation failed', details: formatted.fieldErrors });
      return;
    }
    // Replace the source with the parsed (coerced/defaulted) data
    (req as Record<string, unknown>)[source] = result.data;
    next();
  };
}
