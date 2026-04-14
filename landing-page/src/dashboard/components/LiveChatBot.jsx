import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, AlertCircle, Copy, Check, Loader } from 'lucide-react';
import Button from './Common/Button';
import Input from './Common/Input';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const LiveChatBot = () => {
  const { currentUser } = useAuth();
  const { success, error: showError } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! 👋 I'm your FinTrack AI Assistant. I can answer any questions about features, pricing, billing, account settings, or how to use FinTrack. What can I help you with today?",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callAI = async (userInput, conversationHistory) => {
    try {
      // Use localhost in dev, relative URL in production
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001/api/chat'
        : '/api/chat';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          conversationHistory: conversationHistory,
          userName: currentUser?.full_name || currentUser?.name || 'User',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      return data.message;
    } catch (err) {
      console.error('AI API Error:', err);
      return "I'm having trouble connecting to my AI system right now. Please try again or email us at support@fintrack.app for immediate help.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      // Get AI response
      const aiResponse = await callAI(inputValue, conversationHistory);

      const botMessage = {
        id: messages.length + 2,
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      showError('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText('support@fintrack.app');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 group"
        aria-label="Open AI chat assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-white" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-1rem)] bg-gray-900 dark:bg-gray-950 border border-gray-700 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[600px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-teal-500 px-5 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-sm">FinTrack Assistant</h3>
              <p className="text-xs text-blue-100">Available to help</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800/50">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`px-4 py-2.5 rounded-xl max-w-xs text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-700 text-gray-100 rounded-bl-none'
                  }`}
                >
                  {msg.text.split('\n').map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-2.5 rounded-xl bg-gray-700 text-gray-300 text-sm flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  AI is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-700 bg-gray-800 p-4 space-y-3">
            <div className="flex gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about FinTrack..."
                className="flex-1 px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none text-sm"
                rows="2"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2.5 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Escalation Info */}
            <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-xs text-gray-300">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
                <div>
                  <p className="font-medium mb-1">Need human support?</p>
                  <p className="text-gray-400">Email us at <button onClick={copyEmail} className="text-blue-400 hover:text-blue-300 font-mono inline-flex items-center gap-1">support@fintrack.app{copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}</button></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveChatBot;
