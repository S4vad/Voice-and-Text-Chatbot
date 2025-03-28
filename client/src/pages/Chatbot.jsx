import { ImCancelCircle } from "react-icons/im";
import { MdKeyboardVoice } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getUserFromStorage } from "../../utils/localStorage.js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const user = getUserFromStorage();

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

  useEffect(() => {
    async function fetchChats() {
      if (!user?.id) return;

      try {
        const { data } = await axios.get("http://localhost:5000/getChat", {
          params: { userId: user.id },
        });
        setMessages(data || []);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    }
    fetchChats();
  }, [user?.id]);

  const scrollToBottom = () => {
    if (isScrolledToBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    const threshold = 100;
    isScrolledToBottomRef.current =
      container.scrollHeight - container.scrollTop - container.clientHeight <=
      threshold;
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
    sendMessage(userText);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error", event.error);
    setIsLoading(false);
  };

  const sendMessage = async (message) => {
    resetState();
    setIsLoading(true);

    const userMessageId = Date.now();
    addMessage(message, "user", false, userMessageId);

    const botMessageId = Date.now() + 1;
    addMessage("Generating response...", "bot", true, botMessageId);

    try {
      const { data } = await axios.post("http://localhost:5000/chat", {
        userMessage: message,
        format: "markdown",
      });

      if (!data?.botReply) {
        throw new Error("No bot reply received");
      }

      const formattedResponse = formatResponse(data.botReply);
      startTypingEffect(formattedResponse, botMessageId);
      speakResponse(data.botReply);

      if (user?.id) {
        await axios
          .post("http://localhost:5000/createChat", {
            userId: user.id,
            question: message,
            answer: data.botReply,
          })
          .catch((err) => console.error("Error saving chat:", err));
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
      replaceMessage(botMessageId, "Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
 //for formate response
  const formatResponse = (text) => {
    let formatted = text;
    formatted = formatted.replace(/\n/g, "\n\n");
    formatted = formatted.replace(/(\d+\.|\*|\-)\s/g, "\n$1 ");
    formatted = formatted.replace(/^(#{1,6})\s/gm, "\n$1 ");
    return formatted;
  };

  const addMessage = (content, sender, isLoading = false, id = Date.now()) => {
    setMessages((prev) => [...prev, { content, sender, isLoading, id }]);
  };

  const replaceMessage = (id, newContent) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, content: newContent, isLoading: false } : msg
      )
    );
  };

  const startTypingEffect = (fullText, messageId) => {
    let index = 0;
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    replaceMessage(messageId, "");

    typingIntervalRef.current = setInterval(() => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            return {
              ...msg,
              content: fullText.substring(0, index + 1),
              isLoading: false,
            };
          }
          return msg;
        })
      );

      if (isScrolledToBottomRef.current) {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
      }

      if (index >= fullText.length - 1) {
        clearInterval(typingIntervalRef.current);
      }
      index++;
    }, 15);
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
 

     
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 pb-24 md:pb-32"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400 px-4 text-center">
            {user?.id
              ? "Start speaking by pressing the microphone button"
              : "Please login to start chatting"}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 md:p-4 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white ml-auto max-w-[90%] md:max-w-[80%]"
                    : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white mr-auto max-w-[90%] md:max-w-[80%]"
                }`}
              >
                {msg.sender === "bot" && msg.isLoading ? (
                  <div className="flex items-center gap-2 text-xs">
                    <FaSpinner className="animate-spin" />
                    {msg.content}
                  </div>
                ) : msg.sender === "bot" ? (
                  <div className="prose dark:prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ ...props }) => (
                          <p
                            className="mb-2 text-xs md:text-sm leading-relaxed md:leading-loose tracking-wide"
                            {...props}
                          />
                        ),
                        ul: ({ ...props }) => (
                          <ul
                            className="list-disc pl-5 mb-2 text-xs md:text-sm leading-relaxed md:leading-loose tracking-wide"
                            {...props}
                          />
                        ),
                        ol: ({ ...props }) => (
                          <ol
                            className="list-decimal pl-5 mb-2 text-xs md:text-sm leading-relaxed md:leading-loose tracking-wide"
                            {...props}
                          />
                        ),
                        li: ({ ...props }) => (
                          <li
                            className="mb-1 text-xs md:text-sm leading-relaxed md:leading-loose tracking-wide"
                            {...props}
                          />
                        ),
                        h1: ({ ...props }) => (
                          <h1
                            className="text-lg md:text-xl font-bold my-2 leading-relaxed md:leading-loose tracking-wide"
                            {...props}
                          />
                        ),
                        h2: ({ ...props }) => (
                          <h2
                            className="text-md md:text-lg font-bold my-2 leading-relaxed md:leading-loose tracking-wide"
                            {...props}
                          />
                        ),
                        h3: ({ ...props }) => (
                          <h3
                            className="text-sm md:text-md font-bold my-2 leading-relaxed md:leading-loose tracking-wide"
                            {...props}
                          />
                        ),
                        code: ({ ...props }) => (
                          <code
                            className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-xs md:text-sm leading-relaxed md:leading-loose tracking-wide"
                            {...props}
                          />
                        ),
                        pre: ({ ...props }) => (
                          <pre
                            className="bg-gray-100 dark:bg-gray-800 rounded p-2 my-2 overflow-x-auto text-xs md:text-sm leading-relaxed md:leading-loose tracking-wide"
                            {...props}
                          />
                        ),
                        blockquote: ({ ...props }) => (
                          <blockquote
                            className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2 text-xs md:text-sm leading-relaxed md:leading-loose tracking-wide"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-xs md:text-sm leading-relaxed md:leading-loose tracking-wide">
                    {msg.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 fixed bottom-0">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 md:px-4 md:py-3 text-gray-800 dark:text-gray-200 min-h-[48px] md:min-h-[56px] flex items-center text-sm md:text-base">
            {text || (isLoading ? "Listening..." : "Press the mic to speak...")}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 md:p-3 bg-blue-500 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full transition"
              onClick={startListening}
              disabled={isLoading || !user?.id}
              aria-label="Start voice input"
            >
              <MdKeyboardVoice size={20} />
            </button>
            {isSpeaking && (
              <button
                className="p-2 md:p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition"
                onClick={stopSpeaking}
                aria-label="Stop speaking"
              >
                <ImCancelCircle size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}