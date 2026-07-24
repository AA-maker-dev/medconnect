import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002 = unique constraint violation (e.g. duplicate email)
    if (err.code === 'P2002') {
      statusCode = 409;
      const target = (err.meta?.target as string[] | undefined)?.join(', ');
      message = `A record with this ${target ?? 'value'} already exists`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    } else {
      statusCode = 400;
      message = 'Database request error';
    }
  } else if (err instanceof Error) {
    message = env.IS_PROD ? message : err.message;
  }

  if (statusCode >= 500) {
    logger.error(err instanceof Error ? err : String(err));
  } else {
    logger.warn(`${req.method} ${req.originalUrl} → ${statusCode} ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(env.IS_PROD ? {} : { stack: err instanceof Error ? err.stack : undefined }),
  });
}
