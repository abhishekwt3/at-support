"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatWindow from '../../../components/ChatWindow';

export default function ConversationPage({ params }) {
  const { portalId, conversationCode } = params;
  const router = useRouter();
  const [portal, setPortal] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  useEffect(() => {
    // Generate a unique ID for this customer if not already set
    const generatedId = localStorage.getItem(`customer_id_${conversationCode}`) || 
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    localStorage.setItem(`customer_id_${conversationCode}`, generatedId);
    setCustomerId(generatedId);
    
    // Check if customer name is already set
    const savedName = localStorage.getItem(`customer_name_${conversationCode}`);
    if (savedName) {
      setCustomerName(savedName);
      setFormSubmitted(true);
    }
    
    // Fetch both portal and conversation
    fetchPortalAndConversation();
  }, [conversationCode, portalId]);
  
  const fetchPortalAndConversation = async () => {
    try {
      // First, fetch the portal for the name
      console.log(`Fetching portal with ID: ${portalId}`);
      const portalResponse = await fetch(`http://localhost:3001/api/portal/${portalId}`);
      
      if (!portalResponse.ok) {
        if (portalResponse.status === 404) {
          setError('This portal does not exist');
        } else {
          setError('Failed to load portal');
        }
        setLoading(false);
        return;
      }
      
      const portalData = await portalResponse.json();
      setPortal(portalData.portal);
      
      // Then, fetch the conversation by code
      console.log(`Fetching conversation with code: ${conversationCode}`);
      const convResponse = await fetch(`http://localhost:3001/api/conversation/code/${conversationCode}`);
      
      if (!convResponse.ok) {
        if (convResponse.status === 404) {
          setError('This conversation link is invalid or has expired');
        } else {
          setError('Failed to load conversation');
        }
        setLoading(false);
        return;
      }
      
      const convData = await convResponse.json();
      setConversation(convData.conversation);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load conversation');
      setLoading(false);
    }
  };
  
  const handleStartConversation = async (name) => {
    if (!name.trim()) return;
    
    setCustomerName(name);
    localStorage.setItem(`customer_name_${conversationCode}`, name);
    setFormSubmitted(true);
    
    // Update the conversation with the customer name
    try {
      await fetch(`http://localhost:3001/api/conversation/${conversation.id}/update-customer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: name,
          customerId,
        }),
      });
    } catch (error) {
      console.error('Error updating customer info:', error);
    }
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
          <p className="text-sm text-gray-500">Conversation #{conversationCode}</p>
        </div>
      </header>
      
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col">
        {!formSubmitted ? (
          <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-center">Start Conversation</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleStartConversation(customerName);
            }} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Start Conversation
              </button>
            </form>
          </div>
        ) : (
          <ChatWindow
            conversationId={conversation.id}
            customerId={customerId}
            customerName={customerName}
          />
        )}
      </div>
    </div>
  );
}