"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { portalAPI } from '../../../../lib/api';

export default function ConversationLinksPage({ params }) {
  const { portalName } = params;  // Changed from portalId to portalName
  const router = useRouter();
  const [portal, setPortal] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('General Support');
  const [loading, setLoading] = useState(true);
  const [generatedLink, setGeneratedLink] = useState('');
  
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    
    fetchPortal();
    fetchCategories();
  }, [portalName, router]);
  
  const fetchPortal = async () => {
    try {
      const data = await portalAPI.getPortalById(portalName);  // Still using getPortalById but with portalName
      setPortal(data.portal);
    } catch (error) {
      console.error('Error fetching portal:', error);
      if (error.message === 'Portal not found' || error.message === 'Unauthorized') {
        router.push('/dashboard');
      }
    }
  };
  
  const fetchCategories = async () => {
    try {
      // Fetch categories defined for this portal
      const data = await portalAPI.getPortalCategories(portalName);  // Using portalName
      setCategories(data.categories || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };
  
  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.trim()) return;
    
    try {
      const data = await portalAPI.addCategory(portalName, {  // Using portalName
        name: newCategory
      });
      
      // Add the new category to the list
      setCategories([...categories, data.category]);
      
      // Generate the category link
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}/portal/${portal.customName}/${data.category.slug}`;
      
      setGeneratedLink(fullUrl);
      setNewCategory('');
    } catch (error) {
      console.error('Error adding category:', error);
      alert(error.message);
    }
  };
  
  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };
  
  const generateCategoryUrl = (category) => {
    if (!portal || !portal.customName) return '';
    
    const baseUrl = window.location.origin;
    return `${baseUrl}/portal/${portal.customName}/${category.slug}`;
  };
  
  const handleViewConversations = (category) => {
    router.push(`/dashboard/conversations?category=${category.slug}`);
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!portal) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Portal not found</h2>
          <p className="text-gray-500 mb-4">This portal may have been deleted or you do not have permission to view it.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{portal.name} - Support Categories</h1>
            <p className="text-sm text-gray-500">Share category links with your customers</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Category Form */}
          <div className="col-span-1 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Add Support Category</h2>
            
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category Name
                </label>
                <input
                  type="text"
                  id="category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="e.g. Technical Support"
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Category
              </button>
            </form>
            
            {generatedLink && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Category Link:</h3>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 p-2 border border-gray-300 rounded-l-md text-sm"
                  />
                  <button
                    onClick={() => handleCopyLink(generatedLink)}
                    className="px-3 py-2 bg-gray-200 rounded-r-md hover:bg-gray-300"
                  >
                    Copy
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Share this link with your customers. When they access it, a unique conversation will be created.
                </p>
                <p className="mt-1 text-xs text-green-600">
                  New URL format: /portal/{portal.customName}/[category]
                </p>
              </div>
            )}
          </div>
          
          {/* Category Links List */}
          <div className="col-span-2 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Support Categories
            </h2>
            
            {categories.length === 0 ? (
              <p className="text-gray-500">No categories created yet. Add a category to generate a shareable link.</p>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="border rounded-md p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-gray-500">Slug: {category.slug}</p>
                        <p className="text-sm text-gray-500">Active conversations: {category.activeCount || 0}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            const fullUrl = generateCategoryUrl(category);
                            handleCopyLink(fullUrl);
                          }}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                        >
                          Copy Link
                        </button>
                        
                        <button
                          onClick={() => handleViewConversations(category)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          View Conversations
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 p-4 bg-gray-100 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">How This Works:</h3>
              <p className="text-sm text-gray-600">
                1. Create support categories for different types of inquiries.<br />
                2. Share the category links with your customers.<br />
                3. When a customer accesses a link, a unique conversation is created.<br />
                4. Each conversation gets a unique URL that the customer can bookmark to return to their chat.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}