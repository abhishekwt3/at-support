"use client";

import { useState, useEffect, useRef } from 'react';
import WebSocketChatWindow from './WebSocketChatWindow';
import { formatDate } from '../../lib/utils';

export default function FloatingChatWindow({ 
  conversation, 
  onClose, 
  onMinimize,
  isMinimized = false,
  zIndex = 10
}) {
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef(null);
  
  // Handle dragging behavior
  const startDrag = (e) => {
    if (isMinimized) return;
    
    setDragging(true);
    const rect = windowRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    e.preventDefault();
  };
  
  const doDrag = (e) => {
    if (!dragging) return;
    
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
    e.preventDefault();
  };
  
  const stopDrag = () => {
    setDragging(false);
  };
  
  // Add global event listeners for dragging
  useEffect(() => {
    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', stopDrag);
    
    // Debug log to verify component is mounting with correct props
    console.log("Floating chat window mounted:", { 
      conversationId: conversation?.id,
      isMinimized 
    });
    
    return () => {
      window.removeEventListener('mousemove', doDrag);
      window.removeEventListener('mouseup', stopDrag);
    };
  }, [dragging, dragOffset]);
  
  // If minimized, show only the header
  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-0 right-0 mb-4 mr-4 bg-white rounded-t-lg shadow-lg border border-gray-200 overflow-hidden"
        style={{ 
          width: '300px',
          zIndex: zIndex
        }}
      >
        <div 
          className="bg-blue-600 text-white px-4 py-2 cursor-pointer flex justify-between items-center"
          onClick={onMinimize}
        >
          <div className="font-medium truncate">
            {conversation.customerName || 'Chat'} - {conversation.category}
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onMinimize();
              }}
              className="text-white hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-white hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      ref={windowRef}
      className="fixed bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden resize-drag flex flex-col"
      style={{ 
        width: '400px',
        height: '500px',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: zIndex
      }}
    >
      {/* Header with controls */}
      <div 
        className="bg-blue-600 text-white px-4 py-2 cursor-move flex justify-between items-center"
        onMouseDown={startDrag}
      >
        <div className="font-medium truncate">
          {conversation.customerName || 'Customer'} - {conversation.category}
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={onMinimize}
            className="text-white hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Chat content */}
      <div className="flex-1 overflow-hidden">
        <WebSocketChatWindow
          conversationId={conversation.id}
          customerId={localStorage.getItem('userId')}
          customerName={localStorage.getItem('userName')}
          isOwner={true}
          isFloating={true}
        />
      </div>
    </div>
  );
}