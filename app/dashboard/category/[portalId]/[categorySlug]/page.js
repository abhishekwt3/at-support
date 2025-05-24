"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WebSocketChatWindow from '../../../../components/WebSocketChatWindow';
import { portalAPI, conversationAPI } from '../../../../../lib/api';

export default function CategoryChatsPage({ params }) {
  const { portalId, categorySlug } = params;
  const router = useRouter();
  
  const [portal, setPortal] = useState(null);
  const [category, setCategory] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [categoryUrl, setCategoryUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingConversations, setLoadingConversations] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    
    fetchPortalAndConversations();
  }, [portalId, categorySlug, router]);
  
  // Add useEffect to generate URL when portal data is available
  useEffect(() => {
    if (portal && portal.customName && categorySlug && typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}/portal/${portal.customName}/${categorySlug}`;
      console.log('Setting category URL from useEffect:', fullUrl); // Debug log
      setCategoryUrl(fullUrl);
    }
  }, [portal, categorySlug]);
  
  const fetchPortalAndConversations = async () => {
    setLoading(true);
    try {
      // Fetch portal information
      const portalData = await portalAPI.getPortalById(portalId);
      setPortal(portalData.portal);
      
      // Fetch conversations for this category
      const conversationsData = await portalAPI.getActiveConversations(portalId);
      const filteredConversations = conversationsData.conversations.filter(
        conv => conv.categorySlug === categorySlug
      );
      setConversations(filteredConversations);
      
      // Set category info from the first conversation
      if (filteredConversations.length > 0) {
        setCategory({
          name: filteredConversations[0].category,
          slug: categorySlug
        });
      } else {
        // If no conversations, create category info from slug
        setCategory({
          name: categorySlug.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          slug: categorySlug
        });
      }
      
      // Generate category URL immediately after setting portal
      if (typeof window !== 'undefined' && portalData.portal && portalData.portal.customName) {
        const baseUrl = window.location.origin;
        const fullUrl = `${baseUrl}/portal/${portalData.portal.customName}/${categorySlug}`;
        console.log('Generated category URL:', fullUrl); // Debug log
        setCategoryUrl(fullUrl);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.message === 'Unauthorized') {
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectConversation = async (conversationId) => {
    // Find the conversation in the current list
    let conversation = conversations.find(c => c.id === conversationId);
    
    // If not found in current list, fetch it from the API
    if (!conversation) {
      try {
        const data = await conversationAPI.getConversationById(conversationId);
        conversation = data.conversation;
      } catch (error) {
        console.error("Error fetching conversation:", error);
        return;
      }
    }
    
    if (conversation) {
      setSelectedConversation(conversation);
    }
  };
  
  const handleDeleteConversation = async (conversationId) => {
    if (!window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }
    
    try {
      await conversationAPI.deleteConversation(conversationId);
      
      // Remove the conversation from the list
      setConversations(conversations.filter(conv => conv.id !== conversationId));
      
      // If the deleted conversation was selected, unselect it
      if (selectedConversation && selectedConversation.id === conversationId) {
        setSelectedConversation(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation. Please try again.');
    }
  };
  
  const handleCopyLink = () => {
    if (categoryUrl) {
      navigator.clipboard.writeText(categoryUrl);
      alert('Category link copied to clipboard!');
    } else {
      console.log('Category URL not available:', { portal, categorySlug, categoryUrl }); // Debug log
      alert('Category link not ready yet. Please try again.');
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={() => router.push('/dashboard')}
              className="text-blue-600 hover:text-blue-800 mr-3 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {category?.name || 'Category'} - {portal?.name || 'Portal'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Copy Category Link
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex">
        {/* Left Sidebar: Conversations List */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Conversations</h2>
            {conversations.length === 0 ? (
              <div className="text-center p-4">
                <p className="text-sm text-gray-500">No conversations in this category yet</p>
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`relative p-3 border rounded-md cursor-pointer ${
                      selectedConversation?.id === conversation.id 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div onClick={() => handleSelectConversation(conversation.id)}>
                      <div className="font-medium">
                        {conversation.customerName === 'Unassigned' ? 'New Conversation' : conversation.customerName}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Code: {conversation.uniqueCode}</span>
                        <span>{conversation.messageCount || 0} messages</span>
                      </div>
                    </div>
                    
                    {/* Delete button on top right */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conversation.id);
                      }}
                      className="absolute top-2 right-2 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-1.5 py-0.5 rounded"
                      title="Delete this conversation"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
        
        {/* Main Content: Chat Window */}
        <main className="flex-1 bg-gray-100 overflow-hidden flex flex-col">
          {selectedConversation ? (
            // Chat View
            <div className="h-full flex flex-col">
              <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="font-semibold">
                    {selectedConversation.customerName} - {selectedConversation.category}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Conversation Code: {selectedConversation.uniqueCode}
                  </p>
                </div>
                
                {/* Delete conversation button */}
                <button
                  onClick={() => handleDeleteConversation(selectedConversation.id)}
                  className="px-3 py-1 text-sm bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100"
                  title="Delete this conversation"
                >
                  Delete Conversation
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <WebSocketChatWindow
                  conversationId={selectedConversation.id}
                  customerId={localStorage.getItem('userId')}
                  customerName={localStorage.getItem('userName')}
                  isOwner={true}
                />
              </div>
            </div>
          ) : (
            // Empty State
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-8 max-w-md">
                <h2 className="text-xl font-semibold mb-2">Select a Conversation</h2>
                <p className="text-gray-500 mb-4">
                  {conversations.length === 0 
                    ? "No conversations in this category yet. Share the category link with your customers to start receiving messages." 
                    : "Select a conversation from the sidebar to start chatting"}
                </p>
                <div className="mt-4 p-3 bg-gray-200 rounded-md text-left">
                  <div className="text-sm font-medium mb-1">Share this category link:</div>
                  <div className="flex">
                    <input
                      type="text"
                      value={categoryUrl}
                      readOnly
                      className="flex-1 p-1.5 text-xs border border-gray-300 rounded-l-md"
                      placeholder="Loading category link..."
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded-r-md"
                      disabled={!categoryUrl}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}