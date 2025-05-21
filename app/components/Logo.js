// components/Logo.js
import React from 'react';

export const Logo = ({ className = "h-10 w-auto" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 240 60" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Chat Bubble Background */}
      <rect x="5" y="10" width="50" height="40" rx="8" fill="#3B82F6" />
      
      {/* Connection/Reach Icon - Hand reaching out */}
      <circle cx="30" cy="30" r="12" fill="white" />
      <path d="M22 32C22 32 25 26 30 26C35 26 37 28 38 30" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 32C22 32 25 36 30 36C35 36 38 32 38 32" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Company Name */}
      <text x="65" y="38" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="#2563EB">Reach</text>
      
      {/* Tagline */}
      <text x="65" y="52" fontFamily="Arial, sans-serif" fontSize="10" fill="#4B5563">Simple customer support</text>
    </svg>
  );
};

export const LogoMark = ({ className = "h-8 w-8" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 32 32" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Chat Bubble Background */}
      <rect x="2" y="2" width="28" height="28" rx="6" fill="#3B82F6" />
      
      {/* Speech Bubble Icon with R */}
      <path d="M7 8C7 7.44772 7.44772 7 8 7H24C24.5523 7 25 7.44772 25 8V20C25 20.5523 24.5523 21 24 21H18L13 25V21H8C7.44772 21 7 20.5523 7 20V8Z" fill="white" />
      
      {/* R shape */}
      <path d="M13 11H17C18.1046 11 19 11.8954 19 13C19 14.1046 18.1046 15 17 15H13V11ZM13 15H17L19 18H16.5L14.5 15.5H13V18H11V11H13V15Z" fill="#3B82F6" />
    </svg>
  );
};

export default Logo;