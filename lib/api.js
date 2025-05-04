// lib/api.js

// Backend API URL
const API_URL = 'http://localhost:3001';

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }
  
  return data;
};

// Authentication API methods
export const authAPI = {
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    return handleResponse(response);
  },
  
  register: async (userData) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  },
};

// Portal API methods
export const portalAPI = {
  getPortals: async () => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/api/portals`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return handleResponse(response);
  },
  
  getPortalById: async (portalId) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/api/portals/${portalId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return handleResponse(response);
  },
  
  createPortal: async (portalData) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/api/portals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(portalData),
    });
    
    return handleResponse(response);
  },
  
  getPortalConversations: async (portalId) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/api/portals/${portalId}/conversations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return handleResponse(response);
  },
  
  getActiveConversations: async (portalId) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/api/portals/${portalId}/active-conversations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return handleResponse(response);
  },
  
  generateLink: async (portalId, linkData) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/api/portals/${portalId}/generate-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(linkData),
    });
    
    return handleResponse(response);
  },
};

// Conversation API methods
export const conversationAPI = {
  getConversation: async (conversationId) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/api/conversations/${conversationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return handleResponse(response);
  },
  
  getConversationByCode: async (uniqueCode) => {
    const response = await fetch(`${API_URL}/api/conversation/code/${uniqueCode}`);
    return handleResponse(response);
  },
  
  getConversationMessages: async (conversationId) => {
    const response = await fetch(`${API_URL}/api/conversations/${conversationId}/messages`);
    return handleResponse(response);
  },
  
  updateCustomerInfo: async (conversationId, customerData) => {
    const response = await fetch(`${API_URL}/api/conversation/${conversationId}/update-customer`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });
    
    return handleResponse(response);
  },
  
  deleteConversation: async (conversationId) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/api/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return handleResponse(response);
  },
};

// Message API methods
export const messageAPI = {
  sendMessage: async (messageData) => {
    const response = await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });
    
    return handleResponse(response);
  },
};