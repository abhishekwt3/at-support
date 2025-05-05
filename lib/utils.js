import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

// export const generateUniqueId = () => {
//   return randomBytes(16).toString('hex');
// };

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// export const formatDate = (date) => {
//   return new Date(date).toLocaleString();
// };

// Generate a unique code for conversation links (e.g., FEN3131)
export const generateConversationCode = () => {
  // Generate a 3-letter prefix using uppercase characters
  const prefix = Array(3)
    .fill()
    .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
    .join('');
  
  // Generate a 4-digit number
  const suffix = Math.floor(1000 + Math.random() * 9000);
  
  return `${prefix}${suffix}`;
};

// lib/utils.js

/**
 * Format a date string to a readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check if the date is today
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    // Today - show time only
    return `Today at ${date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit'
    })}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    // Yesterday - show "Yesterday" with time
    return `Yesterday at ${date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit'
    })}`;
  } else {
    // Other dates - show date and time
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Generate a random ID
export function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Create API client for easier handling
export const apiClient = {
  baseUrl: 'http://localhost:3001/api',
  
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Add Authorization header if token exists
    if (!options.headers) {
      options.headers = {};
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add JSON content type for POST, PUT requests
    if (options.method === 'POST' || options.method === 'PUT') {
      options.headers['Content-Type'] = 'application/json';
    }
    
    try {
      const response = await fetch(url, options);
      
      // Handle unauthorized responses
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return null;
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  },
  
  // GET request
  get(endpoint) {
    return this.request(endpoint);
  },
  
  // POST request
  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },
  
  // PUT request
  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },
  
  // DELETE request
  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
};

/**
 * Generate a random unique ID
 * @returns {string} Random unique ID
 */
export function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}