"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ConversationList from '../components/ConversationList';
import { portalAPI } from '@/lib/api';

export default function Dashboard() {
  const router = useRouter();
  const [portals, setPortals] = useState([]);
  const [activeConversations, setActiveConversations] = useState([]);
  const [newPortalName, setNewPortalName] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPortal, setSelectedPortal] = useState(null);
  
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
    try {
      const data = await portalAPI.getPortals();
      setPortals(data.portals);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching portals:', error);
      if (error.message === 'Unauthorized') {
        localStorage.removeItem('token');
        router.push('/');
      }
    }
  };
  
  const fetchActiveConversations = async (portalId) => {
    try {
      const data = await portalAPI.getActiveConversations(portalId);
      setActiveConversations(data.conversations);
    } catch (error) {
      console.error('Error fetching active conversations:', error);
    }
  };
  
  const handleCreatePortal = async (e) => {
    e.preventDefault();
    
    if (!newPortalName.trim()) return;
    
    try {
      const data = await portalAPI.createPortal({
        name: newPortalName
      });
      
      setNewPortalName('');
      setPortals([...portals, data.portal]);
    } catch (error) {
      console.error('Error creating portal:', error);
      alert(error.message);
    }
  };
  
  const handleSelectPortal = (portal) => {
    setSelectedPortal(portal);
    fetchActiveConversations(portal.id);
  };
  
  const handleSelectConversation = (conversationId) => {
    router.push(`/dashboard/conversations/${conversationId}`);
  };
  
  const handleManageConversationLinks = (portalId) => {
    router.push(`/dashboard/conversation-links/${portalId}`);
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Using WebSocket for real-time chat</p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portal Management */}
          <div className="col-span-1 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Your Support Portals</h2>
            
            {portals.length === 0 ? (
              <form onSubmit={handleCreatePortal} className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPortalName}
                    onChange={(e) => setNewPortalName(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="Portal Name (e.g. finance)"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  First, create a portal that represents your department (e.g., finance, support, sales).
                </p>
              </form>
            ) : (
              <p className="text-gray-500 mb-4">
                You already have a portal created. Select it to manage conversations.
              </p>
            )}
            
            <div className="space-y-2">
              {portals.length === 0 ? (
                <p className="text-gray-500">You have not created any portals yet.</p>
              ) : (
                portals.map((portal) => (
                  <div
                    key={portal.id}
                    className={`p-3 border rounded-md ${
                      selectedPortal?.id === portal.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span 
                        className="font-medium cursor-pointer"
                        onClick={() => handleSelectPortal(portal)}
                      >
                        {portal.name}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          onClick={() => handleManageConversationLinks(portal.id)}
                        >
                          Manage Links
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Active Conversations */}
          <div className="col-span-2 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              {selectedPortal ? `Active Conversations in ${selectedPortal.name}` : 'Select a portal to view active conversations'}
            </h2>
            
            {selectedPortal ? (
              <>
                {activeConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No active conversations yet.</p>
                    <button
                      onClick={() => handleManageConversationLinks(selectedPortal.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Generate Conversation Links
                    </button>
                  </div>
                ) : (
                  <ConversationList
                    conversations={activeConversations}
                    onSelectConversation={handleSelectConversation}
                  />
                )}
              </>
            ) : (
              <>
                {portals.length === 0 ? (
                  <p className="text-gray-500">Create a portal first to start managing your customer conversations.</p>
                ) : (
                  <p className="text-gray-500">Select a portal from the left to view active conversations.</p>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}