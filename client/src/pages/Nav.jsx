import React from "react";
import ModeToggle from "../darkmode/ModeToggle";

export default function Nav() {
  return (
    <div className="p-4 w-full md:w-1/6 dark:bg-gray-700 bg-gray-100 flex sm:flex-col flex-row items-center justify-between ">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-logo">Chatbot AI</h1>
        <p className="text-logo text-sm">Powered by Home.LLc</p>
      </div>
      <ModeToggle />
    </div>
  );
}
