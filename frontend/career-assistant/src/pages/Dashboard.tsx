import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Upload,
  User,
  LogOut,
  Plus,
  Trash2,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { chatAPI } from '../lib/api';
import type { Session } from '../types';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuthStore();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const { data } = await chatAPI.getSessions();
      setSessions(data);
    } catch (error) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      const { data } = await chatAPI.createSession();
      setSessions([data, ...sessions]);
      toast.success('New chat session created');
    } catch (error) {
      toast.error('Failed to create session');
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await chatAPI.deleteSession(sessionId);
      setSessions(sessions.filter((s) => s._id !== sessionId));
      toast.success('Session deleted');
    } catch (error) {
      toast.error('Failed to delete session');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Career Assistant</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">{user?.name}</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/chat">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="card cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">New Chat</h3>
                  <p className="text-sm text-gray-600">Start a conversation</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/profile">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="card cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">My Profile</h3>
                  <p className="text-sm text-gray-600">Update your info</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/documents">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="card cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Upload className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Documents</h3>
                  <p className="text-sm text-gray-600">Upload files</p>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Recent Sessions */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Conversations</h2>
            <button onClick={createNewSession} className="btn-primary flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>New Chat</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No conversations yet</p>
              <p className="text-sm text-gray-400 mt-2">Start a new chat to get career advice</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Link
                    to={`/chat/${session._id}`}
                    className="flex items-center space-x-4 flex-1"
                  >
                    <MessageSquare className="w-5 h-5 text-primary-600" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{session.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(session.lastMessageAt)}</span>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => deleteSession(session._id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
