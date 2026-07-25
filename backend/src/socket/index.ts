import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from '../config/env';
import { verifyAccessToken } from '../utils/jwt';
import { logger } from '../utils/logger';

/** 
 * Phase 2 scope: attach Socket.io to the HTTP server and authenticate
 * connecting sockets using the same JWT access token used for REST calls,
 * so Phase 8 can build dedicated appointment chat rooms on top of a
 * connection that's already known to belong to a real, logged-in user.
 *
 * Event handlers (join room, send message, typing indicator, etc.) are
 * intentionally NOT implemented here — that's Phase 8.
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

  io.on('connection', (socket) => {
    logger.debug(`Socket connected: user=${socket.data.userId} role=${socket.data.role}`);

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: user=${socket.data.userId}`);
    });
  });

  return io;
}
