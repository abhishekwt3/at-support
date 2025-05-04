"use client";

import { useState, useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import { getSocket, joinConversation, sendMessage, listenForMessages, leaveConversation } from '../../lib/socket';

// Backend API URL
const API_URL = 'http://localhost:3001';

export default function ChatWindow({ conversationId, customerId, customerName, isOwner = false }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    // Initial load of messages
    fetchMessages();
    
    // Join the conversation room
    joinConversation(conversationId);
    
    // Listen for new messages
    listenForMessages((message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    
    // Cleanup when unmounting
    return () => {
      leaveConversation(conversationId);
    };
  }, [conversationId]);
  
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
        
      const response = await fetch(`${API_URL}${endpoint}`, { headers });
      
      if (!response.ok) {
        console.error('Error fetching messages:', response.statusText);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      setMessages(data.messages || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      // Use Socket.IO to send the message
      sendMessage({
        content: newMessage,
        conversationId,
        senderId: isOwner ? localStorage.getItem('userId') : customerId,
        senderName: isOwner ? localStorage.getItem('userName') : customerName,
        isOwner,
      });
      
      // Clear the input field
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-48">Loading...</div>;
  }
  
  return (
    <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
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
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}