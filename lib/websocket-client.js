// lib/websocket-client.js

let socket = null;
let isConnected = false;
let isConnecting = false;
let reconnectAttempts = 0;
let messageHandlers = new Map();
let pendingMessages = [];
let userId = '';
let userName = '';
let isOwner = false;
let activeRooms = new Set();

// Generate a unique client ID
const clientId = Math.random().toString(36).substring(2, 15);

// Connect to the WebSocket server
export const connect = (id, name, owner = false) => {
  if (isConnecting) return;
  isConnecting = true;
  
  userId = id || `user-${clientId}`;
  userName = name || 'Guest';
  isOwner = owner;
  
  console.log(`Connecting to WebSocket as ${userName} (${userId}), isOwner: ${isOwner}`);
  
  // Create WebSocket connection
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname === 'localhost' ? 'localhost:3001' : window.location.host;
  socket = new WebSocket(`${protocol}//${host}/ws`);
  
  // Connection opened
  socket.addEventListener('open', () => {
    console.log('WebSocket connection established');
    isConnected = true;
    isConnecting = false;
    reconnectAttempts = 0;
    
    // Rejoin any active rooms
    activeRooms.forEach(room => {
      joinConversation(room);
    });
    
    // Send any pending messages
    flushPendingMessages();
    
    // Notify handlers
    notifyHandlers('connect', {});
  });
  
  // Listen for messages
  socket.addEventListener('message', (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('WebSocket message received:', message);
      
      // Handle different message types
      handleMessage(message);
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  
  // Handle connection close
  socket.addEventListener('close', (event) => {
    console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`);
    isConnected = false;
    isConnecting = false;
    
    // Notify handlers
    notifyHandlers('disconnect', { reason: event.reason });
    
    // Attempt to reconnect with exponential backoff
    if (reconnectAttempts < 5) {
      const delay = Math.min(1000 * (2 ** reconnectAttempts), 30000);
      reconnectAttempts++;
      
      console.log(`Attempting to reconnect in ${delay / 1000} seconds... (Attempt ${reconnectAttempts})`);
      setTimeout(() => connect(userId, userName, isOwner), delay);
    } else {
      console.error('Max reconnection attempts reached.');
    }
  });
  
  // Handle connection error
  socket.addEventListener('error', (error) => {
    console.error('WebSocket connection error:', error);
    isConnecting = false;
    
    // Notify handlers
    notifyHandlers('error', { error });
  });
  
  return socket;
};

// Send a message to the server
export const sendMessage = (type, data = {}) => {
  const message = { type, ...data };
  
  if (isConnected && socket && socket.readyState === WebSocket.OPEN) {
    console.log('Sending message:', message);
    socket.send(JSON.stringify(message));
    return true;
  } else {
    console.log('Socket not connected, queuing message:', message);
    pendingMessages.push(message);
    return false;
  }
};

// Send pending messages
const flushPendingMessages = () => {
  if (pendingMessages.length === 0) return;
  
  console.log(`Sending ${pendingMessages.length} pending messages`);
  
  while (pendingMessages.length > 0) {
    const message = pendingMessages.shift();
    sendMessage(message.type, message);
  }
};

// Handle incoming messages
const handleMessage = (message) => {
  const { type } = message;
  
  // Call registered handlers for this message type
  notifyHandlers(type, message);
};

// Notify handlers of an event
const notifyHandlers = (type, message) => {
  if (messageHandlers.has(type)) {
    const handlers = messageHandlers.get(type);
    handlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error(`Error in handler for ${type}:`, error);
      }
    });
  }
};

// Register a message handler
export const onMessage = (type, handler) => {
  if (!messageHandlers.has(type)) {
    messageHandlers.set(type, new Set());
  }
  
  messageHandlers.get(type).add(handler);
  
  // Return a function to unregister the handler
  return () => {
    const handlers = messageHandlers.get(type);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        messageHandlers.delete(type);
      }
    }
  };
};

// Disconnect from the server
export const disconnect = () => {
  if (socket) {
    socket.close();
    socket = null;
    isConnected = false;
    isConnecting = false;
    userId = '';
    userName = '';
    isOwner = false;
    messageHandlers.clear();
    pendingMessages = [];
    activeRooms.clear();
  }
};

// Join a conversation/room
export const joinConversation = (conversationId) => {
  // Add to active rooms set
  activeRooms.add(conversationId);
  
  // Send join message
  return sendMessage('join', {
    conversationId
  });
};

// Leave a conversation/room
export const leaveConversation = (conversationId) => {
  // Remove from active rooms set
  activeRooms.delete(conversationId);
  
  // Send leave message
  return sendMessage('leave', {
    conversationId
  });
};

// Send a chat message
export const sendChatMessage = (content, conversationId) => {
  if (!content || !conversationId) {
    console.error('Content and conversationId are required');
    return null;
  }
  
  // Create the message object
  const messageData = {
    type: 'message',
    content,
    conversationId,
    senderId: userId,
    senderName: userName,
    isOwner
  };
  
  // Send the message
  sendMessage(messageData.type, messageData);
  
  // Return a temporary message for optimistic UI updates
  return {
    id: 'temp-' + Date.now(),
    content,
    senderId: userId,
    conversationId,
    isOwner,
    createdAt: new Date().toISOString(),
    sender: {
      id: userId,
      name: userName
    }
  };
};

// Check connection status
export const isSocketConnected = () => isConnected;

// Listen for new messages
export const listenForMessages = (callback) => {
  // Register for new message events
  return onMessage('new_message', (message) => {
    const messageData = {
      id: message.data?.id || ('temp-' + Date.now()),
      content: message.content,
      senderId: message.senderId,
      conversationId: message.conversationId,
      isOwner: message.isOwner,
      createdAt: message.data?.createdAt || new Date().toISOString(),
      sender: message.data?.sender || {
        id: message.senderId,
        name: message.senderName
      }
    };
    
    console.log('Formatted message for UI:', messageData);
    callback(messageData);
  });
};

// Initialize a default connection
export const initializeSocket = (id, name, owner) => {
  if (!socket) {
    connect(id, name, owner);
  }
  return { isConnected, socket };
};