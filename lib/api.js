// lib/api.js
import { apiClient } from './utils';

// Authentication API
export const authAPI = {
  // Login
  login(data) {
    return apiClient.post('/auth/login', data);
  },
  
  // Register
  register(data) {
    return apiClient.post('/auth/register', data);
  }
};

// Portal API
export const portalAPI = {
  // Get all portals
  getPortals() {
    return apiClient.get('/portals');
  },
  
  // Get portal by ID
  getPortalById(id) {
    return apiClient.get(`/portals/${id}`);
  },
  
  // Create new portal
  createPortal(data) {
    return apiClient.post('/portals', data);
  },
  
  // Get all conversations for a portal
  getPortalConversations(portalId) {
    return apiClient.get(`/portals/${portalId}/conversations`);
  },
  
  // Get active conversations for a portal
  getActiveConversations(portalId) {
    return apiClient.get(`/portals/${portalId}/active-conversations`);
  },
  
  // Generate conversation link
  generateLink(portalId, data) {
    return apiClient.post(`/portals/${portalId}/generate-link`, data);
  }
};

// Conversation API
export const conversationAPI = {
  // Get conversation by ID
  getConversationById(id) {
    return apiClient.get(`/conversations/${id}`);
  },
  
  // Delete conversation
  deleteConversation(id) {
    return apiClient.delete(`/conversations/${id}`);
  },
  
  // Get messages for a conversation
  getConversationMessages(id) {
    return apiClient.get(`/conversations/${id}/messages`);
  },
  
  // Get conversation by code (public)
  getConversationByCode(code) {
    return apiClient.get(`/conversation/code/${code}`);
  },
  
  // Update customer info
  updateCustomerInfo(id, data) {
    return apiClient.put(`/conversation/${id}/update-customer`, data);
  },
  
  // Create conversation (public)
  createConversation(data) {
    return apiClient.post('/conversation/create', data);
  },
  
  // Get public conversation info
  getPublicConversation(id) {
    return apiClient.get(`/conversation/public/${id}`);
  },
  
  // Get public conversation messages
  getPublicConversationMessages(id) {
    return apiClient.get(`/conversation/public/${id}/messages`);
  }
};

// Message API
export const messageAPI = {
  // Send a message
  sendMessage(data) {
    return apiClient.post('/messages', data);
  }
};