import { ImCancelCircle } from "react-icons/im";
import { MdKeyboardVoice } from "react-icons/md";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const isScrolledToBottomRef = useRef(true);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const synth = window.speechSynthesis;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = "en-US";

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (isScrolledToBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    const threshold = 100; // pixels from bottom
    isScrolledToBottomRef.current = 
      container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
  };

  const resetState = () => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    stopSpeaking();
    setIsLoading(false);
  };

  const startListening = () => {
    resetState();
    recognition.start();
  };

  recognition.onresult = (event) => {
    const userText = event.results[0][0].transcript;
    setText(userText);
    addMessage(userText, "user");
    sendMessage(userText);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error", event.error);
    setIsLoading(false);
  };

  const sendMessage = async (message) => {
    resetState();
    setIsLoading(true);
    addMessage("", "bot"); // Start with empty message
    
    try {
      const { data } = await axios.post("http://localhost:5000/chat", {
        userMessage: message,
      });
      updateLastMessage(data.botReply);
      speakResponse(data.botReply);
    } catch (error) {
      console.error("Error:", error);
      updateLastMessage("Failed to fetch response.");
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (content, sender) => {
    setMessages((prev) => [...prev, { content, sender }]);
  };

  const updateLastMessage = (fullText) => {
    let index = 0;
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    
    typingIntervalRef.current = setInterval(() => {
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.sender === "bot") {
          newMessages[newMessages.length - 1] = {
            ...lastMessage,
            content: fullText.substring(0, index + 1)
          };
        }
        return newMessages;
      });

      // Only scroll if user hasn't manually scrolled up
      if (isScrolledToBottomRef.current) {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
      }

      if (index >= fullText.length - 1) {
        clearInterval(typingIntervalRef.current);
      }
      index++;
    }, 20); // Faster typing effect
  };

  const speakResponse = (message) => {
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    speechSynthesisRef.current = utterance;
    synth.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synth.speaking) {
      synth.cancel();
    }
    setIsSpeaking(false);
  };

  return (
    <main className="w-full h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Chat Messages Container */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 pb-24"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            Start speaking by pressing the microphone button
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white ml-auto max-w-[80%]"
                    : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white mr-auto max-w-[80%]"
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Box - Fixed at bottom */}
      <div className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 fixed bottom-0">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 text-gray-800 dark:text-gray-200 min-h-[56px] flex items-center">
            {text || (isLoading ? "Listening..." : "Press the mic to speak...")}
          </div>
          <button
            className="p-3 bg-blue-500 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full transition disabled:opacity-50"
            onClick={startListening}
            disabled={isLoading}
          >
            <MdKeyboardVoice size={20} />
          </button>
          {isSpeaking && (
            <button
              className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition"
              onClick={stopSpeaking}
            >
              <ImCancelCircle size={18} />
            </button>
          )}
        </div>
      </div>
    </main>
  );
}