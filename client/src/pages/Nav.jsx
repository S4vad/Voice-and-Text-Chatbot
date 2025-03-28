import React, { useState } from "react";
import ModeToggle from "../darkmode/ModeToggle";
import { useNavigate } from "react-router-dom";
import { getUserFromStorage } from "../../utils/localStorage.JS";
import { FiPlus, FiMessageSquare } from "react-icons/fi";


import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../components/ui/avatar.jsx";

import { useAuth } from "@/context/AuthContext";

export default function Nav() {
  const [showProfile, setShowProfile] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [hoverButton, setHoverButton] = useState("signup");

  const user = getUserFromStorage();


  const handleHover = () => setShowProfile(true);
  const handleOutHover = () => setShowProfile(false);

  const profileLogout = async () => {
    await logout();
    navigate("/");
  };





  return (
    <div className="p-4 w-full md:w-1/6 dark:bg-gray-800 bg-gray-100 flex space-y-2 sm:flex-col flex-row items-center justify-between border dark:border-gray-700 border-gray-200">
      <div className="text-center mb-6">
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
                  : "text-black dark:text-white bg-gray-200 hover:text-indigo-600 dark:bg-gray-600"
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
                  : "text-black dark:text-white bg-gray-200 hover:text-indigo-600 dark:bg-gray-600"
              }`}
            >
              Sign Up
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div
            className="relative cursor-pointer"
            onMouseOver={handleHover}
            onMouseOut={handleOutHover}
          >
            {user && (
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            )}

            {showProfile && (
              <div
                className="absolute left-0 top-8 z-10 text-center sm:px-2 sm:py-1 w-18 rounded-md border border-gray-200 bg-white shadow-md cursor-pointer  text-red-600 hover:bg-red-100"
                onClick={profileLogout}
              >
                Logout
              </div>
            )}
          </div>
          <div>
            <ModeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
