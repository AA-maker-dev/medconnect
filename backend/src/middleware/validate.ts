import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /**
       * Validated + coerced query params (numbers turned into numbers,
       * defaults applied, enums checked). Controllers should read from
       * here instead of the raw `req.query`, which stays all-strings.
       */
      validatedQuery?: Record<string, unknown>;
    }
  }
}

/**
 * Validates req.body / req.query / req.params against a zod schema shaped
 * as { body?, query?, params? }. Replaces req.body/req.params with the
 * parsed (type-coerced + defaulted) result, and stores the parsed query
 * on req.validatedQuery — some Express/Node combinations make req.query
 * a getter-only property, so we don't risk reassigning it directly.
 */
export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (parsed.body) req.body = parsed.body;
      if (parsed.params) req.params = parsed.params;
      if (parsed.query) req.validatedQuery = parsed.query;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return next(ApiError.badRequest('Validation failed', details));
      }
      next(err);
    }
  };
}
