"use client";

import { formatDate } from '../../lib/utils';

export default function ConversationList({ conversations, onSelectConversation }) {
  // Helper function to get number of messages or a fallback value
  const getMessageCount = (conversation) => {
    // Check for _count.messages (Prisma-style counts)
    if (conversation._count && conversation._count.messages !== undefined) {
      return conversation._count.messages;
    }
    
    // Check for messageCount property (our custom count)
    if (conversation.messageCount !== undefined) {
      return conversation.messageCount;
    }
    
    // Fallback to 0 if no count is available
    return 0;
  };
  
  const handleClick = (conversationId) => {
    console.log("Conversation clicked:", conversationId);
    onSelectConversation(conversationId);
  };
  
  // If there are no conversations, show a message
  if (!conversations || conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No conversations found.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => handleClick(conversation.id)}
          className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer"
        >
          <div className="flex justify-between">
            <div>
              <h3 className="font-medium">
                {conversation.customerName === 'Unassigned' ? 'New Conversation' : conversation.customerName}
              </h3>
              <p className="text-sm text-gray-500">Category: {conversation.category}</p>
              {conversation.uniqueCode && (
                <p className="text-sm text-gray-400">Code: {conversation.uniqueCode}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{formatDate(conversation.updatedAt)}</p>
              <p className="text-sm">
                {getMessageCount(conversation)} {getMessageCount(conversation) === 1 ? 'message' : 'messages'}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}