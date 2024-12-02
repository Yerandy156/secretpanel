import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Users, FileText, Shield } from 'lucide-react';
import RoleManager from './admin/RoleManager';
import UserManager from './admin/UserManager';
import LogViewer from './admin/LogViewer';
import { useAuth } from '../contexts/AuthContext';

type Tab = 'roles' | 'users' | 'logs';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('roles');
  const { user } = useAuth();

  if (!user?.isCEO) return null;

  const tabs = [
    { id: 'roles' as Tab, icon: Shield, label: 'Roles' },
    { id: 'users' as Tab, icon: Users, label: 'Users' },
    { id: 'logs' as Tab, icon: FileText, label: 'Logs' }
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-gray-900 border-l border-gray-800 shadow-xl z-50">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-2 text-purple-400">
            <Settings className="w-5 h-5" />
            <h2 className="text-lg font-bold">Management Console</h2>
          </div>
        </div>

        <div className="flex border-b border-gray-800">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 p-4 flex items-center justify-center space-x-2 transition-colors ${
                activeTab === id
                  ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="p-4"
            >
              {activeTab === 'roles' && <RoleManager />}
              {activeTab === 'users' && <UserManager />}
              {activeTab === 'logs' && <LogViewer />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
