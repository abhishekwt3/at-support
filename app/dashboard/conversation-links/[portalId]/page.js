"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { portalAPI } from '../../../../lib/api';

export default function ConversationLinksPage({ params }) {
  const { portalId } = params;
  const router = useRouter();
  const [portal, setPortal] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [newCategory, setNewCategory] = useState('General Support');
  const [loading, setLoading] = useState(true);
  const [generatedLink, setGeneratedLink] = useState('');
  
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    
    fetchPortal();
    fetchConversations();
  }, [portalId, router]);
  
  const fetchPortal = async () => {
    try {
      const data = await portalAPI.getPortalById(portalId);
      setPortal(data.portal);
    } catch (error) {
      console.error('Error fetching portal:', error);
      if (error.message === 'Portal not found' || error.message === 'Unauthorized') {
        router.push('/dashboard');
      }
    }
  };
  
  const fetchConversations = async () => {
    try {
      const data = await portalAPI.getPortalConversations(portalId);
      setConversations(data.conversations);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };
  
  const handleGenerateLink = async (e) => {
    e.preventDefault();
    
    try {
      const data = await portalAPI.generateLink(portalId, {
        category: newCategory
      });
      
      // Add the new conversation to the list
      setConversations([data.conversation, ...conversations]);
      
      // Generate full URL for sharing
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}/portal/${portalId}/${data.conversation.uniqueCode}`;
      
      setGeneratedLink(fullUrl);
      setNewCategory('General Support');
    } catch (error) {
      console.error('Error generating link:', error);
      alert(error.message);
    }
  };
  
  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };
  
  const handleSelectConversation = (conversationId) => {
    router.push(`/dashboard/conversations/${conversationId}`);
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!portal) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Portal not found</h2>
          <p className="text-gray-500 mb-4">This portal may have been deleted or you do not have permission to view it.</p>
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{portal.name} - Conversation Links</h1>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Link Form */}
          <div className="col-span-1 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Generate New Conversation Link</h2>
            
            <form onSubmit={handleGenerateLink} className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="General Support">General Support</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Billing Issue">Billing Issue</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Complaint">Complaint</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <button
                type="submit"
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Generate Link
              </button>
            </form>
            
            {generatedLink && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Generated Link:</h3>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 p-2 border border-gray-300 rounded-l-md text-sm"
                  />
                  <button
                    onClick={() => handleCopyLink(generatedLink)}
                    className="px-3 py-2 bg-gray-200 rounded-r-md hover:bg-gray-300"
                  >
                    Copy
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Share this link with your customer to start a new conversation.
                </p>
                <p className="mt-1 text-xs text-green-600">
                  This link uses WebSockets for real-time communication.
                </p>
              </div>
            )}
          </div>
          
          {/* Conversation Links List */}
          <div className="col-span-2 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Conversation Links
            </h2>
            
            {conversations.length === 0 ? (
              <p className="text-gray-500">No conversation links generated yet.</p>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="border rounded-md p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{conversation.customerName === 'Unassigned' ? 'Unassigned' : conversation.customerName}</h3>
                        <p className="text-sm text-gray-500">Category: {conversation.category}</p>
                        <p className="text-sm text-gray-500">Code: {conversation.uniqueCode}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            const baseUrl = window.location.origin;
                            const fullUrl = `${baseUrl}/portal/${portalId}/${conversation.uniqueCode}`;
                            handleCopyLink(fullUrl);
                          }}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                        >
                          Copy Link
                        </button>
                        
                        <button
                          onClick={() => handleSelectConversation(conversation.id)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          {conversation.customerName !== 'Unassigned' ? 'View Chat' : 'Check Status'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}