"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Backend API URL
const API_URL = 'http://localhost:3001';

export default function PortalCategoryPage({ params }) {
  const { portalName, categorySlug } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Generate a new conversation when the page loads
    generateConversation();
  }, [portalName, categorySlug]);
  
  const generateConversation = async () => {
    try {
      console.log(`Generating conversation for ${portalName}/${categorySlug}`);
      
      // Call the backend to generate a new conversation
      const response = await fetch(`${API_URL}/api/conversation/category/${portalName}/${categorySlug}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        setError(errorData.error || 'Unable to create a conversation');
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      console.log('Generated conversation:', data);
      
      // Redirect to the conversation page with the unique code
      if (data.redirectURL) {
        router.push(data.redirectURL);
      } else {
        setError('Invalid response from server');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error generating conversation:', error);
      setError('Unable to create a conversation. Please try again later.');
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Creating your conversation...</h2>
          <p className="text-gray-500">Please wait, you will be redirected momentarily.</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-semibold mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => generateConversation()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return null; // This component will redirect, so no need to render anything
}