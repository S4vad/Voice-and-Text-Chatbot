import React from "react";
import Nav from "./Nav";
import ChatBot from "./Chatbot";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-primary flex">
      <Nav />

      <div className="flex-1">
        <ChatBot />
      </div>
    </div>
  );
}
