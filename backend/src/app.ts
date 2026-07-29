import express from 'express';
import path from 'path';
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

  // Security headers. crossOriginResourcePolicy is relaxed to
  // 'cross-origin' because the frontend runs on a different origin/port
  // and needs to load chat attachments (images, PDFs) served from
  // /uploads below — the default 'same-origin' would silently block them.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

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

  // Chat attachments (images, PDFs) — see middleware/chatUpload.ts for
  // how files land here. Static, unauthenticated by design: the URL
  // itself is an unguessable UUID, same tradeoff most chat apps make for
  // attachment CDN links.
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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
