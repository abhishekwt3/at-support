"use client";

import { formatDate } from '../../lib/utils';

export default function MessageItem({ message, isOwner, currentUserIsOwner }) {
  // Determine if this message is from the current user
  const isFromCurrentUser = isOwner === currentUserIsOwner;
  
  return (
    <div
      className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
          isFromCurrentUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-800 rounded-bl-none'
        }`}
      >
        <div className="flex justify-between items-center mb-1">
          <span className="font-semibold text-sm">
            {message.sender?.name || 'Unknown User'}
          </span>
          <span className="text-xs opacity-75">
            {formatDate(message.createdAt)}
          </span>
        </div>
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}