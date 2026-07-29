import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { publicChatFileUrl } from '../middleware/chatUpload';
import * as chatService from '../services/chat.service';

export const listChatRooms = asyncHandler(async (req: Request, res: Response) => {
  const role = req.user!.role;
  if (role !== 'PATIENT' && role !== 'DOCTOR') {
    throw ApiError.forbidden('Only patients and doctors have chat rooms');
  }
  const rooms = await chatService.listChatRooms(req.user!.id, role);
  sendSuccess(res, 200, 'Chat rooms fetched', rooms);
});

export const getRoomInfo = asyncHandler(async (req: Request, res: Response) => {
  const membership = await chatService.getRoomMembership(req.params.roomId, req.user!.id);
  sendSuccess(res, 200, 'Room info fetched', membership);
});

export const listMessages = asyncHandler(async (req: Request, res: Response) => {
  await chatService.getRoomMembership(req.params.roomId, req.user!.id);

  const { page, limit, search } = req.validatedQuery as {
    page: number;
    limit: number;
    search?: string;
  };
  const result = await chatService.listMessages(req.params.roomId, page, limit, search);
  sendSuccess(res, 200, 'Messages fetched', result.items, {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  });
});

/**
 * File attachments go through REST (multipart), not the socket — sockets
 * carry text/JSON events well but aren't a great fit for binary uploads.
 * Once the file is on disk, the client sends a normal 'message:send'
 * socket event with the returned fileUrl, so it still shows up in real
 * time exactly like a text message would.
 */
export const uploadChatFile = asyncHandler(async (req: Request, res: Response) => {
  await chatService.getRoomMembership(req.params.roomId, req.user!.id);

  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }

  const fileUrl = publicChatFileUrl(req.file.filename);
  sendSuccess(res, 201, 'File uploaded', {
    fileUrl,
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
  });
});

export const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await chatService.deleteMessage(req.params.messageId, req.user!.id);
  sendSuccess(res, 200, 'Message deleted', message);
});
