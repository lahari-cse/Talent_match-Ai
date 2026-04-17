import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

const Chatbot = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! I am your AI Career Coach. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  if (!user) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/chat`, {
        messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
      }, config);

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Oops! I encountered an error. Please try again later.' }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-[#121212] border border-zinc-800 w-80 sm:w-96 rounded-2xl shadow-sm flex flex-col h-[500px] max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-bold">Career Coach AI</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-500 p-1 rounded-md transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-tl-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-3 rounded-2xl text-sm bg-zinc-800 border border-zinc-800 text-zinc-400 rounded-tl-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-[#121212] border-t border-zinc-800">
            <form onSubmit={handleSend} className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything..." 
                className="flex-1 bg-zinc-800 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg shadow-blue-600/30 transition-transform hover:scale-105 flex items-center justify-center"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
