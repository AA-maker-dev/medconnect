import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { apiLimiter } from './middleware/rateLimiter';
import { sanitizeBody } from './middleware/sanitize';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';
import routes from './routes';

export function createApp() {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS — must allow credentials for the refresh-token httpOnly cookie
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    })
  );

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // XSS sanitation on every request body, before it hits validators
  app.use(sanitizeBody);

  // General rate limiting (auth routes layer stricter limits on top)
  app.use('/api', apiLimiter);

  app.get('/health', (_req, res) => {
    res.json({ success: true, message: 'MedConnect API is running', time: new Date().toISOString() });
  });

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
