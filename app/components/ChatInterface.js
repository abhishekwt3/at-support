"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ConversationList from '../components/ConversationList';
import WebSocketChatWindow from '../components/WebSocketChatWindow';
import { portalAPI, conversationAPI } from '@/lib/api';

export default function ChatInterface() {
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
  const [showCategoryView, setShowCategoryView] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);

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
        setShowCategoryView(true);
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
    setShowCategoryView(true);
    fetchCategories(portal.id);
  };
  
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setSelectedConversation(null);
    setShowCategoryView(false);
    fetchActiveConversations(selectedPortal.id, category.slug);
  };
  
  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedConversation(null);
    setShowCategoryView(true);
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
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </header>
      
      <div className="flex-1 flex">
        {/* Left Sidebar: Portal Selection or Categories/Conversations */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          {/* Portal Selection */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-2">Your Portals</h2>
            
            {portals.length === 0 ? (
              <form onSubmit={handleCreatePortal} className="mb-2">
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={newPortalName}
                    onChange={(e) => setNewPortalName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    placeholder="Portal Name (e.g. finance)"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full py-1.5 px-3 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    Create Portal
                  </button>
                  {portalError && (
                    <p className="text-xs text-red-600 mt-1">{portalError}</p>
                  )}
                </div>
              </form>
            ) : (
              <div className="space-y-1">
                {portals.map((portal) => (
                  <div
                    key={portal.id}
                    className={`p-2 rounded-md cursor-pointer ${
                      selectedPortal?.id === portal.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelectPortal(portal)}
                  >
                    <div className="font-medium text-sm">{portal.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {selectedPortal && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Categories/Conversations Navigation */}
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                {showCategoryView ? (
                  <h2 className="text-sm font-semibold">Categories</h2>
                ) : (
                  <div className="flex items-center">
                    <button 
                      onClick={handleBackToCategories}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <h2 className="text-sm font-semibold">{selectedCategory?.name}</h2>
                  </div>
                )}
                {!showCategoryView && (
                  <button
                    onClick={() => handleCopyLink(generateCategoryUrl(selectedCategory))}
                    className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    title="Copy category link"
                  >
                    Copy Link
                  </button>
                )}
              </div>
              
              {/* List Content: Categories or Conversations */}
              <div className="flex-1 overflow-y-auto">
                {showCategoryView ? (
                  // Categories List
                  <div className="p-2">
                    {loadingCategories ? (
                      <div className="flex justify-center items-center h-24">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      </div>
                    ) : categories.length === 0 ? (
                      <div className="text-center p-4">
                        <p className="text-sm text-gray-500">No categories yet</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                          >
                            <div 
                              className="flex justify-between items-start"
                              onClick={() => handleSelectCategory(category)}
                            >
                              <div>
                                <div className="font-medium text-sm">{category.name}</div>
                                <div className="text-xs text-gray-500">
                                  {category.activeCount || 0} active
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCategory(category);
                                }}
                                className="text-xs px-1.5 py-0.5 text-red-600 hover:bg-red-50 rounded"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Conversations List
                  <div className="p-2">
                    {loadingConversations ? (
                      <div className="flex justify-center items-center h-24">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      </div>
                    ) : conversations.length === 0 ? (
                      <div className="text-center p-4 text-sm text-gray-500">
                        <p>No conversations in this category</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {conversations.map((conversation) => (
                          <div
                            key={conversation.id}
                            onClick={() => handleSelectConversation(conversation.id)}
                            className={`p-2 border rounded-md cursor-pointer ${
                              selectedConversation?.id === conversation.id 
                                ? 'bg-blue-50 border-blue-300' 
                                : 'hover:bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="font-medium text-sm truncate">
                              {conversation.customerName === 'Unassigned' ? 'New Conversation' : conversation.customerName}
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>Code: {conversation.uniqueCode}</span>
                              <span>{conversation.messageCount || 0} msgs</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Category Form */}
              {showCategoryView && (
                <div className="p-3 border-t border-gray-200">
                  <form onSubmit={handleAddCategory} className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-1.5 text-sm"
                      placeholder="New Category Name"
                    />
                    <button
                      type="submit"
                      className="w-full py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Category
                    </button>
                  </form>
                  {categoryError && (
                    <p className="text-xs text-red-600 mt-1">{categoryError}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </aside>
        
        {/* Main Content Area */}
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
            // Empty State or Welcome
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-8 max-w-md">
                {!selectedPortal ? (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Welcome to your Dashboard</h2>
                    <p className="text-gray-500 mb-4">
                      {portals.length === 0 
                        ? "Create a portal to start managing customer conversations" 
                        : "Select a portal from the sidebar to manage your support categories and conversations"}
                    </p>
                  </div>
                ) : showCategoryView ? (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Manage Support Categories</h2>
                    <p className="text-gray-500 mb-4">
                      {categories.length === 0 
                        ? "Create categories to organize your customer conversations" 
                        : "Select a category to view conversations or add new categories"}
                    </p>
                    {generatedLink && (
                      <div className="mt-4 p-3 bg-gray-200 rounded-md text-left">
                        <div className="text-sm font-medium mb-1">Category Link Created:</div>
                        <div className="flex">
                          <input
                            type="text"
                            value={generatedLink}
                            readOnly
                            className="flex-1 p-1.5 text-xs border border-gray-300 rounded-l-md"
                          />
                          <button
                            onClick={() => handleCopyLink(generatedLink)}
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded-r-md"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{selectedCategory?.name} Conversations</h2>
                    <p className="text-gray-500 mb-4">
                      {conversations.length === 0 
                        ? "No conversations in this category yet" 
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
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}