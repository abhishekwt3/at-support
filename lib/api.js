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
  getPortalById(portalName) {
    return apiClient.get(`/portals/${portalName}`);
  },
  
  // Create new portal
  createPortal(data) {
    return apiClient.post('/portals', data);
  },
  
  // Get all conversations for a portal
  getPortalConversations(portalName) {
    return apiClient.get(`/portals/${portalName}/conversations`);
  },
  
  // Get active conversations for a portal
  getActiveConversations(portalName) {
    return apiClient.get(`/portals/${portalName}/active-conversations`);
  },
  
  // Get categories for a portal
  getPortalCategories(portalName) {
    return apiClient.get(`/portals/${portalName}/categories`);
  },
  
  // Add a category to a portal
  addCategory(portalName, data) {
    return apiClient.post(`/portals/${portalName}/categories`, data);
  },
  
  // Generate conversation link (legacy - kept for backward compatibility)
  generateLink(portalName, data) {
    return apiClient.post(`/portals/${portalName}/generate-link`, data);
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
  
  // Get conversation by URL params (public)
  getConversationByURLParams(portalName, categorySlug, uniqueCode) {
    return apiClient.get(`/conversation/find/${portalName}/${categorySlug}/${uniqueCode}`);
  },
  
  // Generate a new conversation from category (public)
  generateFromCategory(portalName, categorySlug) {
    return apiClient.get(`/conversation/category/${portalName}/${categorySlug}`);
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