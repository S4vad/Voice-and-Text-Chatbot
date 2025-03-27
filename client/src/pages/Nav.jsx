import React, { useState } from "react";
import ModeToggle from "../darkmode/ModeToggle";
import { useNavigate } from "react-router-dom";
import { getUserFromStorage } from "../../utils/localStorage.JS";

export default function Nav() {
  const navigate = useNavigate();
  const [hoverButton, setHoverButton] = useState("signup");
  const user = getUserFromStorage();
  return (
    <div className="p-4 w-full md:w-1/6 dark:bg-gray-700 bg-gray-100 flex sm:flex-col flex-row items-center justify-between ">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-logo">Chatbot AI</h1>
        <p className="text-logo text-sm">Powered by Home.LLc</p>
      </div>
      <div className="flex flex-row sm:flex-col items-center space-x-4 sm:space-y-8 sm:mb-20">
        {!user && (
          <div className="flex  text-sm">
            <button
              onClick={() => navigate("/login")}
              onMouseEnter={() => setHoverButton("login")}
              onMouseLeave={() => setHoverButton("signup")}
              className={`rounded-lg md:px-4 px-2 py-1 md:py-2 transition duration-300 ${
                hoverButton === "login"
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "text-black bg-gray-200 hover:text-indigo-600 dark:bg-gray-600"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              onMouseEnter={() => setHoverButton("signup")}
              onMouseLeave={() => setHoverButton("signup")}
              className={`rounded-lg md:px-4 px-2 py-1 md:py-2 transition duration-300 ${
                hoverButton === "signup"
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "text-black bg-gray-200 hover:text-indigo-600 dark:bg-gray-600"
              }`}
            >
              Sign Up
            </button>
          </div>
        )}
        <div>
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
