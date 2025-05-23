"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import WebSocketChatWindow from '../../../components/WebSocketChatWindow';

// Backend API URL
const API_URL = 'http://localhost:3001';

export default function ConversationPage({ params }) {
  const { conversationId } = params;
  const router = useRouter();
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is authenticated using localStorage token
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    
    fetchConversation();
  }, [conversationId, router]);
  
  const fetchConversation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/dashboard');
          return;
        }
        throw new Error('Failed to fetch conversation');
      }
      
      const data = await response.json();
      console.log('Fetched conversation:', data.conversation);
      setConversation(data.conversation);
      setLoading(false);
      
      // Store user info for message sending
      if (data.conversation.owner) {
        localStorage.setItem('userId', data.conversation.owner.id);
        localStorage.setItem('userName', data.conversation.owner.name);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      setLoading(false);
    }
  };
  
  const handleDeleteConversation = async () => {
    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        router.push('/dashboard');
      } else {
        const data = await response.json();
        console.error('Error deleting conversation:', data.error);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading conversation...</div>;
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
        <WebSocketChatWindow
          conversationId={conversationId}
          customerId={localStorage.getItem('userId')}
          customerName={localStorage.getItem('userName')}
          isOwner={true}
        />
      </div>
    </div>
  );
}