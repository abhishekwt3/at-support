"use client";

import { use } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MessageItem from '../../../components/MessageItem';
import { conversationAPI } from '../../../../lib/api';

export default function ConversationPage({ params }) {
    // Unwrap params
  const resolvedParams = use(params);
  const { conversationId } = resolvedParams;
  const { id } = params;
  const { data: session, status } = useSession();
  
  const router = useRouter();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    // Check if user is authenticated using localStorage token instead of useSession
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    
    fetchConversation();
    
    // Set up polling for new messages
    const interval = setInterval(fetchConversation, 10000);
    return () => clearInterval(interval);
  }, [conversationId, router]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const fetchConversation = async () => {
    try {
      const response = await fetch(`/api/conversation/${id}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/dashboard');
          return;
        }
        throw new Error('Failed to fetch conversation');
      }
      
      const data = await response.json();
      setConversation(data.conversation);
      setMessages(data.conversation.messages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      setLoading(false);
    }
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          conversationId: id,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessages([...messages, data.message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  const handleDeleteConversation = async () => {
    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/conversation/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!conversation) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Conversation not found</h2>
          <p className="text-gray-500 mb-4">This conversation may have been deleted or you do not have permission to view it.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Conversation with {conversation.customerName}</h1>
            <p className="text-sm text-gray-500">Category: {conversation.category}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleDeleteConversation}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col">
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
      </div>
    </div>
  );
}