"use client";

import { useState, useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import { 
  connect, 
  isSocketConnected, 
  joinConversation, 
  leaveConversation, 
  sendChatMessage, 
  listenForMessages,
  onMessage
} from '../../lib/websocket-client';

// Backend API URL
const API_URL = 'http://localhost:3001';

export default function WebSocketChatWindow({ conversationId, customerId, customerName, isOwner = false }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    // Initial load of messages
    fetchMessages();
    
    // Initialize WebSocket connection
    // For owner, use their actual user ID and name from localStorage
    // For customer, use the provided customer ID and name
    connect(
      isOwner ? localStorage.getItem('userId') : customerId,
      isOwner ? localStorage.getItem('userName') : customerName,
      isOwner
    );
    
    // Register connection event handlers
    const connectUnsubscribe = onMessage('connect', () => {
      console.log('WebSocket connected');
      setSocketConnected(true);
      joinConversation(conversationId);
    });
    
    const disconnectUnsubscribe = onMessage('disconnect', () => {
      console.log('WebSocket disconnected');
      setSocketConnected(false);
    });
    
    // Listen for new messages
    const messageUnsubscribe = listenForMessages((message) => {
      console.log('Received new message in chat window:', message);
      
      // Format the incoming message to match database format
      const formattedMessage = {
        ...message,
        // Ensure these fields are properly set for consistent UI rendering
        isOwner: !!message.isOwner,
        sender: message.sender || {
          id: message.senderId,
          name: message.senderName
        }
      };
      
      setMessages((prevMessages) => {
        // Check if message already exists in the array to prevent duplicates
        // Also replace any temporary messages with real ones
        const filteredMessages = prevMessages.filter(m => 
          !m.id.startsWith('temp-') && m.id !== message.id
        );
        return [...filteredMessages, formattedMessage];
      });
    });
    
    // Update connection status
    const connectionCheck = setInterval(() => {
      setSocketConnected(isSocketConnected());
    }, 1000);
    
    // Cleanup when unmounting
    return () => {
      console.log('Cleaning up chat window');
      leaveConversation(conversationId);
      connectUnsubscribe();
      disconnectUnsubscribe();
      messageUnsubscribe();
      clearInterval(connectionCheck);
    };
  }, [conversationId, customerId, customerName, isOwner]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const fetchMessages = async () => {
    try {
      // Prepare headers
      const headers = {};
      
      // If user is owner (admin), add authentication
      if (isOwner) {
        const token = localStorage.getItem('token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      
      // Use direct fetch to the backend URL - using the public endpoint
      // This is important: we're using a different endpoint for customers vs. admin
      const endpoint = isOwner 
        ? `/api/conversations/${conversationId}/messages` 
        : `/api/conversation/public/${conversationId}/messages`;
        
      console.log(`Fetching messages from: ${API_URL}${endpoint}`);
      const response = await fetch(`${API_URL}${endpoint}`, { headers });
      
      if (!response.ok) {
        console.error('Error fetching messages:', response.statusText);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      console.log('Fetched messages:', data.messages);
      
      // Process messages to ensure consistent format
      const processedMessages = data.messages?.map(message => {
        return {
          ...message,
          // Ensure isOwner is always a boolean
          isOwner: !!message.isOwner
        };
      }) || [];
      
      setMessages(processedMessages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending) return;
    
    try {
      setIsSending(true);
      
      // Send message via WebSocket
      console.log('Sending message via WebSocket');
      const tempMessage = sendChatMessage(newMessage, conversationId);
      
      // Add message to UI immediately for better UX
      if (tempMessage) {
        // Format the temporary message to match the database format
        const formattedTempMessage = {
          ...tempMessage,
          isOwner: isOwner, // Explicitly set based on current user role
        };
        setMessages(prev => [...prev, formattedTempMessage]);
      }
      
      // Clear the input field
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-48">Loading conversations...</div>;
  }
  
  return (
    <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
      <div className="p-2 bg-gray-100 border-b text-sm">
        {socketConnected ? (
          <span className="text-green-600 flex items-center">
            <span className="w-2 h-2 bg-green-600 rounded-full inline-block mr-2"></span>
            Connected (WebSocket)
          </span>
        ) : (
          <span className="text-red-600 flex items-center">
            <span className="w-2 h-2 bg-red-600 rounded-full inline-block mr-2"></span>
            Connecting... (WebSocket)
          </span>
        )}
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 my-8">No messages yet. Send a message to start the conversation.</p>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                isOwner={message.isOwner}
                currentUserIsOwner={isOwner}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="Type your message..."
            disabled={isSending}
          />
          <button
            type="submit"
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isSending || !socketConnected}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}