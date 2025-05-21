"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ConversationList from '../components/ConversationList';
import WebSocketChatWindow from '../components/WebSocketChatWindow';
import { portalAPI, conversationAPI } from '@/lib/api';

export default function Dashboard() {
  const router = useRouter();
  
  // Portal state
  const [portals, setPortals] = useState([]);
  const [newPortalName, setNewPortalName] = useState('');
  const [selectedPortal, setSelectedPortal] = useState(null);
  const [editingPortalId, setEditingPortalId] = useState(null);
  const [editPortalName, setEditPortalName] = useState('');
  const [portalError, setPortalError] = useState('');
  
  // Categories state
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('General Support');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [generatedLink, setGeneratedLink] = useState('');
  const [categoryError, setCategoryError] = useState('');
  
  // Conversations state
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  
  // View state
  const [showChatInterface, setShowChatInterface] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    
    fetchPortals();
  }, [router]);
  
  const fetchPortals = async () => {
    setLoading(true);
    try {
      const data = await portalAPI.getPortals();
      setPortals(data.portals);
      
      // If there's only one portal, select it automatically
      if (data.portals && data.portals.length === 1) {
        setSelectedPortal(data.portals[0]);
        fetchCategories(data.portals[0].id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching portals:', error);
      if (error.message === 'Unauthorized') {
        localStorage.removeItem('token');
        router.push('/');
      }
      setLoading(false);
    }
  };
  
  const fetchCategories = async (portalId) => {
    setLoadingCategories(true);
    try {
      const data = await portalAPI.getPortalCategories(portalId);
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
      setLoading(false);
    }
  };
  
  const fetchActiveConversations = async (portalId, categorySlug = null) => {
    setLoadingConversations(true);
    try {
      const data = await portalAPI.getActiveConversations(portalId);
      const allConversations = data.conversations || [];
      
      // If category is selected, filter conversations by category
      if (categorySlug) {
        const filteredConversations = allConversations.filter(
          conv => conv.categorySlug === categorySlug
        );
        setConversations(filteredConversations);
      } else {
        setConversations(allConversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  };
  
  const handleCreatePortal = async (e) => {
    e.preventDefault();
    
    if (!newPortalName.trim()) return;
    
    try {
      setPortalError('');
      const data = await portalAPI.createPortal({
        name: newPortalName
      });
      
      setNewPortalName('');
      const newPortal = data.portal;
      setPortals([...portals, newPortal]);
      
      // Automatically select the newly created portal
      setSelectedPortal(newPortal);
      fetchCategories(newPortal.id);
    } catch (error) {
      console.error('Error creating portal:', error);
      setPortalError(error.message || 'Failed to create portal');
    }
  };
  
  const startEditingPortal = (portal) => {
    setEditingPortalId(portal.id);
    setEditPortalName(portal.name);
    setPortalError('');
  };
  
  const cancelEditingPortal = () => {
    setEditingPortalId(null);
    setEditPortalName('');
    setPortalError('');
  };
  
  const handleUpdatePortalName = async (portalId) => {
    if (!editPortalName.trim() || editPortalName === selectedPortal.name) {
      cancelEditingPortal();
      return;
    }
    
    try {
      setPortalError('');
      
      // First check if there are any conversations
      const conversationsData = await portalAPI.getPortalConversations(portalId);
      if (conversationsData.conversations && conversationsData.conversations.length > 0) {
        setPortalError('Cannot rename portal with existing conversations. Please delete all conversations first.');
        return;
      }
      
      // If no conversations, proceed with the update
      const data = await portalAPI.updatePortal(portalId, {
        name: editPortalName
      });
      
      // Update portals list
      setPortals(portals.map(p => 
        p.id === portalId ? { ...p, name: data.portal.name, customName: data.portal.customName } : p
      ));
      
      // Update selected portal if it's the one being edited
      if (selectedPortal && selectedPortal.id === portalId) {
        setSelectedPortal(data.portal);
      }
      
      // Exit edit mode
      setEditingPortalId(null);
      setEditPortalName('');
    } catch (error) {
      console.error('Error updating portal name:', error);
      setPortalError(error.message || 'Failed to update portal name');
    }
  };
  
  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.trim() || !selectedPortal) return;
    
    try {
      setCategoryError('');
      const data = await portalAPI.addCategory(selectedPortal.id, {
        name: newCategory
      });
      
      // Add the new category to the list
      setCategories([...categories, data.category]);
      
      // Generate the category link
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}/portal/${selectedPortal.customName}/${data.category.slug}`;
      
      setGeneratedLink(fullUrl);
      setNewCategory('');
    } catch (error) {
      console.error('Error adding category:', error);
      setCategoryError(error.message || 'Failed to add category');
    }
  };
  
  const handleDeleteCategory = async (category) => {
    if (!window.confirm('Are you sure you want to delete this category? This will remove all conversations in this category.')) {
      return;
    }
    
    try {
      setCategoryError('');
      await portalAPI.deleteCategory(selectedPortal.id, category.slug);
      
      // Remove the category from the list
      setCategories(categories.filter(cat => cat.slug !== category.slug));
      
      // If the deleted category was selected, unselect it
      if (selectedCategory && selectedCategory.slug === category.slug) {
        setSelectedCategory(null);
        setShowChatInterface(false);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setCategoryError(error.message || 'Failed to delete category');
    }
  };
  
  const handleSelectPortal = (portal) => {
    setSelectedPortal(portal);
    setSelectedCategory(null);
    setSelectedConversation(null);
    setShowChatInterface(false);
    fetchCategories(portal.id);
  };
  
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setSelectedConversation(null);
    setShowChatInterface(true);
    fetchActiveConversations(selectedPortal.id, category.slug);
  };
  
  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedConversation(null);
    setShowChatInterface(false);
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
  
  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };
  
  const generateCategoryUrl = (category) => {
    if (!selectedPortal || !selectedPortal.customName) return '';
    
    const baseUrl = window.location.origin;
    return `${baseUrl}/portal/${selectedPortal.customName}/${category.slug}`;
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };
  
  if (loading && !selectedPortal) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // If showing chat interface, render the Slack/WhatsApp style interface
  if (showChatInterface && selectedCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <button 
                onClick={handleBackToCategories}
                className="text-blue-600 hover:text-blue-800 mr-3 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Dashboard
              </button>
              <h1 className="text-xl font-bold text-gray-900">{selectedCategory.name} - {selectedPortal.name}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleCopyLink(generateCategoryUrl(selectedCategory))}
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
              {loadingConversations ? (
                <div className="flex justify-center items-center h-12 mt-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-sm text-gray-500">No conversations in this category yet</p>
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation.id)}
                      className={`p-3 border rounded-md cursor-pointer ${
                        selectedConversation?.id === conversation.id 
                          ? 'bg-blue-50 border-blue-300' 
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="font-medium">
                        {conversation.customerName === 'Unassigned' ? 'New Conversation' : conversation.customerName}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Code: {conversation.uniqueCode}</span>
                        <span>{conversation.messageCount || 0} messages</span>
                      </div>
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
                <div className="p-4 bg-white border-b border-gray-200">
                  <h2 className="font-semibold">
                    {selectedConversation.customerName} - {selectedConversation.category}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Conversation Code: {selectedConversation.uniqueCode}
                  </p>
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
                        value={generateCategoryUrl(selectedCategory)}
                        readOnly
                        className="flex-1 p-1.5 text-xs border border-gray-300 rounded-l-md"
                      />
                      <button
                        onClick={() => handleCopyLink(generateCategoryUrl(selectedCategory))}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded-r-md"
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
  
  // Otherwise, show the original dashboard layout
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Portal Management - Left Sidebar */}
          <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Your Support Portals</h2>
            
            {portals.length === 0 ? (
              <form onSubmit={handleCreatePortal} className="mb-6">
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={newPortalName}
                    onChange={(e) => setNewPortalName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="Portal Name (e.g. finance)"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Portal
                  </button>
                  {portalError && (
                    <p className="text-sm text-red-600 mt-1">{portalError}</p>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  First, create a portal that represents your department.
                </p>
              </form>
            ) : (
              <div className="space-y-2">
                {portals.map((portal) => (
                  <div
                    key={portal.id}
                    className={`p-3 border rounded-md ${
                      selectedPortal?.id === portal.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    {editingPortalId === portal.id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={editPortalName}
                          onChange={(e) => setEditPortalName(e.target.value)}
                          className="w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdatePortalName(portal.id)}
                            className="flex-1 px-2 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditingPortal}
                            className="flex-1 px-2 py-1 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                        {portalError && (
                          <p className="text-xs text-red-600 mt-1">{portalError}</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-center">
                          <div 
                            className="font-medium cursor-pointer"
                            onClick={() => handleSelectPortal(portal)}
                          >
                            {portal.name}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingPortal(portal);
                            }}
                            className="text-gray-500 hover:text-blue-600"
                            title="Edit portal name"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>
                        {portal.customName && (
                          <p className="text-xs text-gray-500 mt-1">
                            URL: /portal/{portal.customName}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Middle Section - Categories */}
          <div className="lg:col-span-9">
            {!selectedPortal ? (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-500">
                  {portals.length === 0 
                    ? "Create a portal first to start managing your customer conversations." 
                    : "Select a portal from the left to manage categories and conversations."}
                </p>
              </div>
            ) : (
              /* Categories View */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Create Category Form */}
                <div className="md:col-span-1 bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Add Support Category</h2>
                  
                  <form onSubmit={handleAddCategory} className="space-y-4">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        Category Name
                      </label>
                      <input
                        type="text"
                        id="category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="e.g. Technical Support"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Add Category
                    </button>
                  </form>
                  
                  {categoryError && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{categoryError}</p>
                    </div>
                  )}
                  
                  {generatedLink && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-md">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Category Link:</h3>
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
                        Share this link with your customers. When they access it, a unique conversation will be created.
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Category List */}
                <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">
                    Support Categories
                  </h2>
                  
                  {loadingCategories ? (
                    <div className="flex justify-center items-center h-48">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : categories.length === 0 ? (
                    <p className="text-gray-500">No categories created yet. Add a category to generate a shareable link.</p>
                  ) : (
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="border rounded-md p-4 hover:bg-gray-50"
                        >
                          <div className="flex justify-between items-start">
                            <div 
                              className="cursor-pointer"
                              onClick={() => handleSelectCategory(category)}
                            >
                              <h3 className="font-medium">{category.name}</h3>
                              <p className="text-sm text-gray-500">Active conversations: {category.activeCount || 0}</p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const fullUrl = generateCategoryUrl(category);
                                  handleCopyLink(fullUrl);
                                }}
                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                              >
                                Copy Link
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectCategory(category);
                                }}
                                className="px-3 py-1 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100"
                              >
                                View Chats
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCategory(category);
                                }}
                                className="px-3 py-1 text-sm bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100"
                                title="Delete this category"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-6 p-4 bg-gray-100 rounded-md">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">How This Works:</h3>
                    <p className="text-sm text-gray-600">
                      1. Create support categories for different types of inquiries.<br />
                      2. Share the category links with your customers.<br />
                      3. When a customer accesses a link, a unique conversation is created.<br />
                      4. Click on a category or View Chats to manage conversations.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}