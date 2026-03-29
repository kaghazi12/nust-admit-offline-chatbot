"use client";

import { useState, useEffect, useRef } from "react";
import { searchFAQs } from "../lib/search";

export default function Home() {
  const [faqs, setFaqs] = useState([]);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      type: "bot",
      text: "Welcome to NUST Admit, your offline admissions assistant. Ask me anything about NUST admissions!",
    },
  ]);
  const [isDark, setIsDark] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
    
    // Load FAQs from Electron IPC
    if (window.nustFAQ && window.nustFAQ.getData) {
      window.nustFAQ.getData().then((data) => {
        setFaqs(data);
      }).catch(err => {
        console.error("Failed to load FAQs", err);
      });
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSearch = (e) => {
    e.preventDefault();
    const text = query.trim();
    if (!text) return;

    // Add user message
    const newMessages = [
      ...messages,
      { id: Date.now().toString(), type: "user", text },
    ];
    setMessages(newMessages);
    setQuery("");

    // Search natively
    const match = searchFAQs(text, faqs);
    if (match) {
      setMessages([
        ...newMessages,
        {
          id: (Date.now() + 1).toString(),
          type: "bot",
          text: match.answer,
          matchedQuestion: match.question,
        },
      ]);
    } else {
      setMessages([
        ...newMessages,
        {
          id: (Date.now() + 1).toString(),
          type: "bot",
          text: "The official FAQ doesn't cover this. Contact NUST directly at +92-51-90856878 or admissions@nust.edu.pk",
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-screen  bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="flex justify-between items-center p-4 bg-nust-green text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-nust-gold flex justify-center items-center font-bold text-nust-green shadow-sm">
            N
          </div>
          <div>
            <h1 className="text-xl font-bold font-serif tracking-wide">NUST Admit</h1>
            <p className="text-xs text-green-200">Offline Assistant</p>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded hover:bg-green-700 transition"
          aria-label="Toggle Theme"
        >
          {isDark ? "☀️ Light" : "🌙 Dark"}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto w-full">
        <div className="p-4 sm:p-6 space-y-4 max-w-4xl mx-auto w-full">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-2xl p-4 rounded-xl shadow-sm ${
                  msg.type === "user"
                    ? "bg-nust-green text-white rounded-br-none"
                    : "bg-white dark:bg-gray-800 text-foreground rounded-bl-none border border-gray-100 dark:border-gray-700"
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-md text-foreground z-10 relative">
        <form
          className="max-w-4xl mx-auto flex gap-2 relative items-center"
          onSubmit={handleSearch}
        >
          <input
            type="text"
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-5 py-3 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-nust-green focus:border-transparent transition-all shadow-inner"
            placeholder="Type your question here..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            disabled={!query.trim()}
            className="bg-nust-gold text-nust-green font-bold rounded-full px-6 py-3 hover:brightness-110 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            Ask
          </button>
        </form>
      </footer>
    </div>
  );
}
