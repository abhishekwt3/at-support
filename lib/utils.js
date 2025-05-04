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
  const isToday = date.getDate() === today.getDate() &&
                 date.getMonth() === today.getMonth() &&
                 date.getFullYear() === today.getFullYear();
  
  if (isToday) {
    // Format as time only for today
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    // Format as date and time for other days
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}

/**
 * Generate a random unique ID
 * @returns {string} Random unique ID
 */
export function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}