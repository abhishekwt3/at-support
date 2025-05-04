// lib/socket.js
import { io } from 'socket.io-client';

// Backend URL
const SOCKET_URL = 'http://localhost:3001';

let socket;

export const initSocket = () => {
  socket = io(SOCKET_URL);

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const joinConversation = (conversationId) => {
  const socket = getSocket();
  socket.emit('join', conversationId);
};

export const sendMessage = (messageData) => {
  const socket = getSocket();
  socket.emit('send_message', messageData);
};

export const listenForMessages = (callback) => {
  const socket = getSocket();
  socket.on('new_message', (message) => {
    callback(message);
  });
};

export const leaveConversation = (conversationId) => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('leave', conversationId);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};