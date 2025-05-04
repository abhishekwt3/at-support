"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserForm from '../../components/UserForm';
import ChatWindow from '../../components/ChatWindow';

export default function PortalPage({ params }) {
  const { portalId } = params;
  const router = useRouter();
  const [portal, setPortal] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [customerId, setCustomerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Generate a unique ID for this customer
    const generatedId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setCustomerId(generatedId);
    
    fetchPortal();
    
    // Check for existing conversation
    const savedConversation = localStorage.getItem(`conversation_${portalId}`);
    if (savedConversation) {
      try {
        setConversation(JSON.parse(savedConversation));
      } catch (e) {
        console.error('Error parsing saved conversation:', e);
        localStorage.removeItem(`conversation_${portalId}`);
      }
    }
  }, [portalId]);
  
  const fetchPortal = async () => {
    try {
      const response = await fetch(`/api/portal/${portalId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Support portal not found');
        } else {
          setError('Failed to load support portal');
        }
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      setPortal(data.portal);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching portal:', error);
      setError('Failed to load support portal');
      setLoading(false);
    }
  };
  
  const handleStartConversation = (newConversation) => {
    setConversation(newConversation);
    localStorage.setItem(`conversation_${portalId}`, JSON.stringify(newConversation));
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-gray-900">{portal.name} Support</h1>
        </div>
      </header>
      
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col">
        {!conversation ? (
          <UserForm portalId={portalId} onStartConversation={handleStartConversation} />
        ) : (
          <ChatWindow
            conversationId={conversation.id}
            customerId={customerId}
            customerName={conversation.customerName}
          />
        )}
      </div>
    </div>
  );
}