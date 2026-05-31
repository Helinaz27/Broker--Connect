import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../constants/api';

const SOCKET_URL = API_BASE_URL.replace('/api', '');

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (socket?.connected) return socket;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
  });
  return socket;
};

export const getSocket = (): Socket => {
  if (!socket) throw new Error('Socket not connected');
  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
