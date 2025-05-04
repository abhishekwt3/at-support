"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatWindow from '../../components/ChatWindow';

// This page is a direct chat view, used if you want to share a direct link to a conversation
export default function ChatPage({ params }) {
  const { conversationId } = params;
  const router = useRouter();
  const [conversation, setConversation] = useState(null);
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchConversation();
    
    // Generate or retrieve customer ID
    let id = localStorage.getItem(`customer_id_${conversationId}`);
    if (!id) {
      id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem(`customer_id_${conversationId}`, id);
    }
    setCustomerId(id);
    
    // Retrieve name if stored
    const name = localStorage.getItem(`customer_name_${conversationId}`);
    if (name) {
      setCustomerName(name);
    }
  }, [conversationId]);
  
  const fetchConversation = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/conversation/public/${conversationId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch conversation');
      }
      
      const data = await response.json();
      setConversation(data.conversation);
      
      if (!customerName && data.conversation.customerName) {
        setCustomerName(data.conversation.customerName);
        localStorage.setItem(`customer_name_${conversationId}`, data.conversation.customerName);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!conversation) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Conversation not found</h2>
          <p className="text-gray-500">This conversation may have been deleted.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-gray-900">Support Chat</h1>
        </div>
      </header>
      
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col">
        <ChatWindow
          conversationId={conversationId}
          customerId={customerId}
          customerName={customerName}
        />
      </div>
    </div>
  );
}