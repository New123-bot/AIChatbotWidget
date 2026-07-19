import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Bot, User, Sparkles, AlertCircle, RefreshCw, Layers, ArrowRight, Zap, CheckCircle2, Activity, Globe, Database } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [history, setHistory] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your NexusCloud assistant. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isLoading]);

  // Handle message sending
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage.trim();
    setInputMessage("");
    setError(null);

    // Capture timestamp
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message to local chat state
    const updatedHistory: Message[] = [
      ...history,
      { role: "user", content: userMsg, timestamp: now }
    ];
    setHistory(updatedHistory);
    setIsLoading(true);

    try {
      // Map frontend history format to expected API history structure
      const apiHistory = history.map(({ role, content }) => ({ role, content }));

      // Send to Express API endpoint
      const response = await axios.post("/api/chat", {
        message: userMsg,
        history: apiHistory
      });

      const responseData = response.data;
      
      // DeepSeek format: choices[0].message.content
      const botResponse = responseData?.choices?.[0]?.message?.content || "Sorry, I received an invalid response format from the server.";

      setHistory(prev => [
        ...prev,
        {
          role: "assistant",
          content: botResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.error("API Error:", err);
      let errMsg = "Unable to connect to the assistant server.";
      if (err.response?.data?.error) {
        errMsg = err.response.data.error;
      }
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Preset query suggestions to help users test easily
  const handleSuggestionClick = (text: string) => {
    setInputMessage(text);
  };

  const handleClearChat = () => {
    setHistory([
      {
        role: "assistant",
        content: "Chat history cleared. How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Sleek Header / Navbar */}
      <nav className="h-16 bg-white border-b border-slate-200 px-6 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
            <Layers className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">NexusCloud</span>
        </div>
        
        <div className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
          <span className="text-blue-600 cursor-pointer">Dashboard</span>
          <span className="hover:text-slate-800 transition cursor-pointer">Analytics</span>
          <span className="hover:text-slate-800 transition cursor-pointer">Infrastructure</span>
          <span className="hover:text-slate-800 transition cursor-pointer">Settings</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:flex items-center space-x-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>All nodes live</span>
          </span>
          <div className="w-9 h-9 bg-slate-200 rounded-full border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
              AD
            </div>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Overview & Metrics (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Hero / Project Overview Card */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <div className="inline-flex items-center space-x-1 bg-blue-50 border border-blue-100 text-blue-600 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2.5">
                  <Sparkles className="w-3 h-3" />
                  <span>DeepSeek API Powered</span>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Project Overview</h1>
                <p className="text-slate-500 text-sm mt-1">Real-time status of your global deployment nodes and customer support traffic distribution.</p>
              </div>
            </div>

            {/* Interactive Infrastructure Graph Representation */}
            <div className="mt-6 h-52 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center p-4 text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2.5 border border-blue-100">
                <Globe className="w-6 h-6 text-blue-600 animate-spin" style={{ animationDuration: '10s' }} />
              </div>
              <span className="text-slate-700 font-semibold text-sm">Interactive DNS Infrastructure Map</span>
              <p className="text-xs text-slate-400 max-w-sm mt-1">Simulated status overlay connecting virtual nodes directly to the floating assistant client in bottom-right.</p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-start justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Total Requests</div>
                <div className="text-3xl font-bold text-slate-900">1,248,930</div>
                <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                  <span className="font-semibold">+12.5%</span> from last week
                </div>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 border border-green-100">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-start justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Active Nodes</div>
                <div className="text-3xl font-bold text-slate-900">84 / 84</div>
                <div className="mt-2 text-xs text-blue-600 font-medium">
                  All systems operational
                </div>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                <Database className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Support Widget Guide & Instructions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm h-full flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <span>Live Assistant Testing</span>
              </h3>
              
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                This console is fully integrated with a custom Express backend. Try sending pre-defined customer issues or questions below.
              </p>

              <div className="space-y-3.5">
                <div className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">CORS Support Endpoint</span> is live on port <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">4000/api</code> proxy.
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Floating widget toggle</span> in the bottom right opens chat automatically.
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Dynamic history tracking</span> retains past messages in queries.
                  </div>
                </div>
              </div>
            </div>

            {/* In-Console Quick Test Options */}
            <div className="mt-8 pt-6 border-t border-slate-150">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-3">Predefined support queries</span>
              <div className="space-y-2">
                <button 
                  onClick={() => { handleSuggestionClick("What are the pricing tiers for Apex Cloud?"); setIsOpen(true); }}
                  className="w-full text-left text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 hover:border-blue-500/40 px-3.5 py-2.5 rounded-xl text-slate-700 transition flex items-center justify-between group cursor-pointer"
                >
                  <span className="font-medium">"What are the pricing tiers?"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition" />
                </button>
                <button 
                  onClick={() => { handleSuggestionClick("How do I connect my domain using Apex DNS?"); setIsOpen(true); }}
                  className="w-full text-left text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 hover:border-blue-500/40 px-3.5 py-2.5 rounded-xl text-slate-700 transition flex items-center justify-between group cursor-pointer"
                >
                  <span className="font-medium">"How do I connect my custom domain?"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400 mt-auto shrink-0">
        <p>© 2026 NexusCloud Systems. Powered by DeepSeek and Node.js Express Gateway.</p>
      </footer>

      {/* --- FLOATING CHATBOT WIDGET SECTION --- */}
      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end">
        
        {/* Chat Window (Open State) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="chatbot-window"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="w-[calc(100vw-2rem)] sm:w-[400px] h-[520px] max-h-[calc(100vh-140px)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-4 max-w-[calc(100vw-2rem)] sm:max-w-[400px]"
            >
              {/* Header */}
              <div className="bg-blue-600 p-4 flex items-center justify-between text-white shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-400/30 rounded-full flex items-center justify-center relative">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                    </svg>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">AI Assistant</h4>
                    <p className="text-[10px] text-blue-100 uppercase tracking-wider">Powered by DeepSeek</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {/* Reset/Clear Chat */}
                  <button 
                    onClick={handleClearChat}
                    title="Reset Conversation"
                    className="p-1.5 hover:bg-blue-500 rounded-lg transition-colors text-white"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  {/* Close Widget */}
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-blue-500 rounded-lg transition-colors text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
                {history.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {/* Bot Avatar */}
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 flex items-center justify-center border border-slate-300/40">
                        <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                        </svg>
                      </div>
                    )}

                    <div className="flex flex-col max-w-[80%]">
                      <div
                        className={`p-3 rounded-2xl shadow-sm text-sm ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white rounded-tr-none shadow-md"
                            : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className={`text-[9px] text-slate-400 mt-1 px-1 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* User Avatar */}
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-blue-600 shrink-0 flex items-center justify-center text-white text-xs font-semibold shadow-md shadow-blue-500/10">
                        U
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator / typing dots */}
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 flex items-center justify-center">
                      <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Connection/Error Banner */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5 text-red-700 text-xs shadow-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                    <div>
                      <p className="font-semibold">Configuration Needed</p>
                      <p className="mt-0.5 leading-relaxed">{error}</p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions / Quick Replies inside the chat */}
              {history.length === 1 && !isLoading && (
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-150 flex flex-wrap gap-1.5 shrink-0">
                  <button 
                    onClick={() => handleSuggestionClick("Hi! What features are available?")}
                    className="text-[10px] font-semibold bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-500/30 text-slate-600 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    🚀 Features
                  </button>
                  <button 
                    onClick={() => handleSuggestionClick("How do I get an API Key?")}
                    className="text-[10px] font-semibold bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-500/30 text-slate-600 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    🔑 Developer API
                  </button>
                </div>
              )}

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 placeholder-slate-400 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    className="absolute right-2 p-2 text-blue-600 hover:bg-slate-200 rounded-lg transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 text-center mt-3">AI responses may be inaccurate. Check documentation.</p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Bubble */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-16 h-16 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-all border-4 border-white select-none relative"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                {/* Visual live pulse indicator */}
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-blue-600 rounded-full shadow-sm animate-pulse"></span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
