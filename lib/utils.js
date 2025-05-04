import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

export const generateUniqueId = () => {
  return randomBytes(16).toString('hex');
};

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

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