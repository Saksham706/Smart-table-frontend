import { io } from 'socket.io-client';

let socket = null;
const API_URL =  import.meta.env.VITE_API_URL
export const initSocket = (userId) => {
  if (!socket) {
    socket = io(`${API_URL}`, {
      transports: ['websocket'],
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socket.emit('join', userId);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
