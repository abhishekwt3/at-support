"use client";

import { useState } from 'react';

export default function UserForm({ portalId, onStartConversation }) {
  const [customerName, setCustomerName] = useState('');
  const [category, setCategory] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customerName.trim() || !category.trim()) return;
    
    try {
      const response = await fetch('/api/conversation/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portalId,
          customerName,
          category,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitted(true);
        onStartConversation(data.conversation);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };
  
  if (submitted) {
    return null;
  }
  
  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-center">Start a Conversation</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            What can we help you with?
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            <option value="">Select a category</option>
            <option value="General Question">General Question</option>
            <option value="Technical Support">Technical Support</option>
            <option value="Billing Issue">Billing Issue</option>
            <option value="Feature Request">Feature Request</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Start Conversation
        </button>
      </form>
    </div>
  );
}