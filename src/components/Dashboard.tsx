import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, User, Megaphone, ArrowLeft, FileText, Settings, EyeOff, Shield } from 'lucide-react';
import PostForm from './PostForm';
import PostList from './PostList';
import Profile from './Profile';
import Announcements from './Announcements';
import AdminPanel from './AdminPanel';
import LogViewer from './admin/LogViewer';
import SecretService from './SecretService';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';

type TabType = 'home' | 'profile' | 'announcements' | 'management' | 'logs' | 'secret-service';

export default function Dashboard() {
  const { user, actualUser, logout, impersonatedUser, stopImpersonating } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);

  const handleProfileView = (userId: string) => {
    setViewingUserId(userId);
    setActiveTab('profile');
  };

  const handleBack = () => {
    setViewingUserId(null);
    setActiveTab('home');
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'home':
        return 'Home';
      case 'profile':
        return 'Profile';
      case 'announcements':
        return 'Announcements';
      case 'management':
        return 'Management Console';
      case 'logs':
        return 'System Logs';
      case 'secret-service':
        return 'Secret Service';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-800 p-4 flex flex-col bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-8 p-3 bg-gray-800/50 rounded-lg">
          {user?.avatar ? (
            <img src={user.avatar} alt="profile" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-xl">{user?.displayName[0]}</span>
            </div>
          )}
          <div>
            <div className="font-bold">{user?.displayName}</div>
            <div className="text-sm text-gray-400">@{user?.agentId}</div>
          </div>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => {
              setActiveTab('home');
              setViewingUserId(null);
            }}
            className={`flex items-center space-x-2 p-3 rounded-lg w-full transition-colors ${
              activeTab === 'home' ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-gray-800/50'
            }`}
          >
            <Home size={20} />
            <span>Home</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab('profile');
              setViewingUserId(user?.id || null);
            }}
            className={`flex items-center space-x-2 p-3 rounded-lg w-full transition-colors ${
              activeTab === 'profile' && viewingUserId === user?.id ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-gray-800/50'
            }`}
          >
            <User size={20} />
            <span>Profile</span>
          </button>
          
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center space-x-2 p-3 rounded-lg w-full transition-colors ${
              activeTab === 'announcements' ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-gray-800/50'
            }`}
          >
            <Megaphone size={20} />
            <span>Announcements</span>
          </button>

          <button
            onClick={() => setActiveTab('secret-service')}
            className={`flex items-center space-x-2 p-3 rounded-lg w-full transition-colors ${
              activeTab === 'secret-service' ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-gray-800/50'
            }`}
          >
            <Shield size={20} />
            <span>Secret Service</span>
          </button>

          {actualUser?.isCEO && (
            <>
              <button
                onClick={() => setActiveTab('management')}
                className={`flex items-center space-x-2 p-3 rounded-lg w-full transition-colors ${
                  activeTab === 'management' ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-gray-800/50'
                }`}
              >
                <Settings size={20} />
                <span>Management</span>
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={`flex items-center space-x-2 p-3 rounded-lg w-full transition-colors ${
                  activeTab === 'logs' ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-gray-800/50'
                }`}
              >
                <FileText size={20} />
                <span>Logs</span>
              </button>
            </>
          )}
        </nav>

        <div className="mt-auto space-y-2">
          {impersonatedUser && (
            <button
              onClick={() => {
                stopImpersonating();
                toast.success(`Stopped viewing ${impersonatedUser.displayName}'s session`);
              }}
              className="w-full flex items-center space-x-2 p-3 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors"
            >
              <EyeOff size={20} />
              <span>Stop Viewing @{impersonatedUser.agentId}</span>
            </button>
          )}
          
          <button
            onClick={logout}
            className="w-full flex items-center space-x-2 p-3 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-3xl mx-auto border-r border-gray-800">
        <header className="p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between">
            {viewingUserId && activeTab === 'profile' && viewingUserId !== user?.id ? (
              <div className="flex items-center space-x-3">
                <button onClick={handleBack} className="p-2 hover:bg-gray-800 rounded-full">
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold">Profile</h1>
              </div>
            ) : (
              <h1 className="text-xl font-bold">{getTabTitle()}</h1>
            )}
            {impersonatedUser && (
              <div className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">
                Viewing as @{impersonatedUser.agentId}
              </div>
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (viewingUserId || '')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'home' && (
              <div className="space-y-6 p-4">
                <PostForm />
                <PostList onProfileClick={handleProfileView} />
              </div>
            )}
            {activeTab === 'profile' && (
              <Profile userId={viewingUserId || user?.id || ''} onPostClick={handleProfileView} />
            )}
            {activeTab === 'announcements' && (
              <Announcements />
            )}
            {activeTab === 'secret-service' && (
              <SecretService />
            )}
            {activeTab === 'management' && actualUser?.isCEO && (
              <div className="p-4">
                <AdminPanel />
              </div>
            )}
            {activeTab === 'logs' && actualUser?.isCEO && (
              <div className="p-4">
                <LogViewer />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
