import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { connectSocket, disconnectSocket, getSocket } from '@/services/socket';

interface SocketContextValue {
  socket: Socket;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socket = getSocket();

  useEffect(() => {
    // Only patients and doctors have chat rooms — no reason for an admin
    // session (or a not-yet-restored session) to hold a socket open.
    if (!isAuthenticated || (user?.role !== 'PATIENT' && user?.role !== 'DOCTOR')) {
      disconnectSocket();
      setIsConnected(false);
      return;
    }

    connectSocket();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [isAuthenticated, user?.role, socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
}
