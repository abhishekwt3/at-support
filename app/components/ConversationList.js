"use client";

import { formatDate } from '../../lib/utils';

export default function ConversationList({ conversations, onSelectConversation }) {
  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => onSelectConversation(conversation.id)}
          className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer"
        >
          <div className="flex justify-between">
            <div>
              <h3 className="font-medium">{conversation.customerName}</h3>
              <p className="text-sm text-gray-500">Category: {conversation.category}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{formatDate(conversation.updatedAt)}</p>
              <p className="text-sm">{conversation._count.messages} messages</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}