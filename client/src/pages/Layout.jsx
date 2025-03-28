import React, { useState } from 'react';
import Nav from './Nav';
import ChatBot from './Chatbot';

export default function Layout() {
  const [activeChatId, setActiveChatId] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-primary flex">
  
      <Nav activeChatId={activeChatId} setActiveChatId={setActiveChatId} />

      <div className="flex-1">
        <ChatBot activeChatId={activeChatId} />
      </div>
    </div>
  );
}