import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Loader2, Bot, User as UserIcon } from 'lucide-react';
import { chatAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import type { Chat, Session } from '../types';
import toast from 'react-hot-toast';

export const ChatPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [session, setSession] = useState<Session | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    } else {
      createNewSession();
    }
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewSession = async () => {
    try {
      const { data } = await chatAPI.createSession('New Conversation');
      navigate(`/chat/${data._id}`, { replace: true });
    } catch (error) {
      toast.error('Failed to create session');
      navigate('/dashboard');
    }
  };

  const loadSession = async () => {
    try {
      const { data } = await chatAPI.getSession(sessionId!);
      setSession(data.session);
      setChats(data.chats);
    } catch (error) {
      toast.error('Failed to load conversation');
      navigate('/dashboard');
    } finally {
      setLoadingChats(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = message;
    setMessage('');
    setLoading(true);

    try {
      const { data } = await chatAPI.sendMessage(sessionId!, userMessage);
      setChats([...chats, data.userMessage, data.assistantMessage]);
    } catch (error) {
      toast.error('Failed to send message');
      setMessage(userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-semibold text-gray-900">
                {session?.title || 'New Conversation'}
              </h1>
              <p className="text-sm text-gray-500">AI Career Assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <UserIcon className="w-4 h-4" />
            <span>{user?.name}</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {loadingChats ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Start Your Conversation
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Ask me anything about your career! I can help with resume tips, job search
                strategies, skill development, and more.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {[
                  'How can I improve my resume?',
                  'What skills should I learn?',
                  'Career change advice',
                  'Interview preparation tips',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setMessage(suggestion)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-primary-300 hover:text-primary-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {chats.map((chat) => (
                  <motion.div
                    key={chat._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex space-x-3 max-w-3xl ${
                        chat.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          chat.role === 'user' ? 'bg-primary-600' : 'bg-gray-600'
                        }`}
                      >
                        {chat.role === 'user' ? (
                          <UserIcon className="w-5 h-5 text-white" />
                        ) : (
                          <Bot className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          chat.role === 'user'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{chat.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto">
          <div className="flex space-x-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything about your career..."
              className="flex-1 input-field"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="btn-primary flex items-center space-x-2 px-6"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">{loading ? 'Sending...' : 'Send'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
