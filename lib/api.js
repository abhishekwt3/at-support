// API utilities for communicating with the Go server

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper function for making API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Include auth token if it exists
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Parse the JSON response
  const data = await response.json();
  
  // Throw an error if the request failed
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  
  return data;
}

// Auth API calls
export const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
};

// Portal API calls
export const portalAPI = {
  getPortals: () => apiRequest('/portals'),
  
  getPortalById: (id) => apiRequest(`/portals/${id}`),
  
  createPortal: (data) => apiRequest('/portals', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  generateLink: (portalId, data) => apiRequest(`/portals/${portalId}/generate-link`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  getPortalConversations: (portalId) => apiRequest(`/portals/${portalId}/conversations`),
  
  getActiveConversations: (portalId) => apiRequest(`/portals/${portalId}/active-conversations`),
};

// Conversation API calls
export const conversationAPI = {
  getConversation: (id) => apiRequest(`/conversations/${id}`),
  
  deleteConversation: (id) => apiRequest(`/conversations/${id}`, {
    method: 'DELETE',
  }),
  
  getConversationMessages: (id) => apiRequest(`/conversations/${id}/messages`),
  
  getConversationByCode: (code) => apiRequest(`/conversation/code/${code}`),
  
  updateCustomerInfo: (id, data) => apiRequest(`/conversation/${id}/update-customer`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  createConversation: (data) => apiRequest('/conversation/create', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  getPublicConversation: (id) => apiRequest(`/conversation/public/${id}`),
};

// Message API calls
export const messageAPI = {
  sendMessage: (data) => apiRequest('/messages', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};