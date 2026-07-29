import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import { ApiError } from '../utils/ApiError';

/**
 * Chat attachments (images, PDFs, prescription files) are stored on local
 * disk in dev, served back via the /uploads static route registered in
 * app.ts. This mirrors the pattern used for SMS elsewhere in the project
 * (architecture-ready, real provider wired in later): swapping to
 * Cloudinary means changing only this file's storage engine — controllers
 * and the frontend only ever see a `fileUrl`, never a disk path.
 */
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'chat');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuid()}${ext}`);
  },
});

export const chatUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(ApiError.badRequest('Only images and PDF files can be shared in chat'));
      return;
    }
    cb(null, true);
  },
});

export function publicChatFileUrl(filename: string): string {
  return `/uploads/chat/${filename}`;
}
