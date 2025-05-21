"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WebSocketChatWindow from '../../../components/WebSocketChatWindow';

// Backend API URL
const API_URL = 'http://localhost:3001';

export default function PortalParamsPage({ params }) {
  // Extract URL parameters
  const { portalName, params: urlParams } = params; 
  
  // We expect either [uniqueCode] or [categorySlug, uniqueCode]
  if (!urlParams || urlParams.length < 1) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Invalid URL</h2>
          <p className="text-gray-500">The URL format is incorrect.</p>
        </div>
      </div>
    );
  }
  
  // Handle two formats:
  // 1. /portal/[portalName]/[uniqueCode]
  // 2. /portal/[portalName]/[categorySlug]/[uniqueCode]
  
  let categorySlug = '';
  let uniqueCode = '';
  
  if (urlParams.length === 1) {
    // Format 1: Just the uniqueCode
    uniqueCode = urlParams[0];
  } else {
    // Format 2: categorySlug and uniqueCode
    categorySlug = urlParams[0];
    uniqueCode = urlParams[1];
  }
  
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
    const generatedId = localStorage.getItem(`customer_id_${uniqueCode}`) || 
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    localStorage.setItem(`customer_id_${uniqueCode}`, generatedId);
    setCustomerId(generatedId);
    
    // Check if customer name is already set
    const savedName = localStorage.getItem(`customer_name_${uniqueCode}`);
    if (savedName) {
      setCustomerName(savedName);
      setFormSubmitted(true);
    }
    
    // Fetch conversation details based on the URL parameters
    if (categorySlug) {
      // Format 2: Use both parameters
      fetchConversationByURLParams();
    } else {
      // Format 1: Use just the uniqueCode
      fetchConversationByCode();
    }
  }, [portalName, categorySlug, uniqueCode]);
  
  const fetchConversationByURLParams = async () => {
    try {
      // Use the new endpoint to fetch conversation by URL parameters
      console.log(`Fetching conversation with params: ${portalName}/${categorySlug}/${uniqueCode}`);
      const response = await fetch(`${API_URL}/api/conversation/find/${portalName}/${categorySlug}/${uniqueCode}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('This conversation link is invalid or has expired');
        } else {
          setError('Failed to load conversation');
        }
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      setPortal(data.portal);
      setConversation(data.conversation);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load conversation');
      setLoading(false);
    }
  };
  
  const fetchConversationByCode = async () => {
    try {
      // Use the endpoint to fetch conversation by code
      console.log(`Fetching conversation with code: ${uniqueCode}`);
      const response = await fetch(`${API_URL}/api/conversation/code/${uniqueCode}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('This conversation code is invalid or has expired');
        } else {
          setError('Failed to load conversation');
        }
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      setConversation(data.conversation);
      
      // Fetch the portal separately
      const portalResponse = await fetch(`${API_URL}/api/portal/${data.conversation.portalId}`);
      if (portalResponse.ok) {
        const portalData = await portalResponse.json();
        setPortal(portalData.portal);
      }
      
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
    localStorage.setItem(`customer_name_${uniqueCode}`, name);
    setFormSubmitted(true);
    
    // Update the conversation with the customer name
    try {
      await fetch(`${API_URL}/api/conversation/${conversation.id}/update-customer`, {
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
  
  if (!conversation || !portal) {
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
          <h1 className="text-xl font-bold text-gray-900">{portal.name} Support</h1>
          <p className="text-sm text-gray-500">Category: {conversation.category}</p>
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
          <WebSocketChatWindow
            conversationId={conversation.id}
            customerId={customerId}
            customerName={customerName}
            isOwner={false}
          />
        )}
      </div>
    </div>
  );
}