import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from '../config/env';
import { verifyAccessToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import { registerChatHandlers } from './chat.socket';

/**
 * Attaches Socket.io to the HTTP server, authenticates connecting sockets
 * using the same JWT access token used for REST calls, and registers the
 * Phase 8 real-time chat event handlers (see chat.socket.ts).
 */
export function initSocket(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.SOCKET_CORS_ORIGIN,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ??
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const payload = verifyAccessToken(token);
      socket.data.userId = payload.userId;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  registerChatHandlers(io);

  io.on('connection', (socket) => {
    logger.debug(`Socket connected: user=${socket.data.userId} role=${socket.data.role}`);
  });

  return io;
}
