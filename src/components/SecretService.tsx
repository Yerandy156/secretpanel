import { useState } from 'react';
import { Search, Shield, Lock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function SecretService() {
  const [username, setUsername] = useState('');
  const [searching, setSearching] = useState(false);
  const [userFound, setUserFound] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [backdoorFound, setBackdoorFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchUser = async () => {
    if (!username) {
      toast.error('Please enter a Roblox username');
      return;
    }

    setSearching(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setUserFound(true);
    setSearching(false);
    toast.success('Roblox user found');
  };

  const scanGames = async () => {
    if (!userFound) return;

    setScanning(true);
    // Simulate scanning
    await new Promise(resolve => setTimeout(resolve, 2000));
    setBackdoorFound(true);
    setScanning(false);
    toast.success('Backdoored games found');
  };

  const loadSecretService = async () => {
    if (!backdoorFound) return;

    setLoading(true);
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    toast.success('Secret Service loaded successfully');
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-purple-500/20 rounded-full mx-auto flex items-center justify-center"
        >
          <Shield className="w-8 h-8 text-purple-400" />
        </motion.div>
        <h2 className="text-2xl font-bold">Secret Service Interface</h2>
        <p className="text-gray-400">Secure scanning and backdoor detection system</p>
      </div>

      {/* Main Interface */}
      <div className="max-w-md mx-auto space-y-6">
        {/* Username Search */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-400">Roblox Username</label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 pl-10"
              placeholder="Enter username..."
              disabled={userFound}
            />
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
          </div>
          <motion.button
            onClick={searchUser}
            disabled={searching || userFound}
            className="w-full bg-purple-500/20 text-purple-400 rounded-lg px-4 py-3 flex items-center justify-center space-x-2 hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {searching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>{searching ? 'Searching...' : 'Search User'}</span>
          </motion.button>
        </div>

        {/* Scan Games Button */}
        <AnimatePresence>
          {userFound && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <motion.button
                onClick={scanGames}
                disabled={scanning || backdoorFound}
                className="w-full bg-blue-500/20 text-blue-400 rounded-lg px-4 py-3 flex items-center justify-center space-x-2 hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {scanning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span>{scanning ? 'Scanning...' : 'Search For Backdoor Games'}</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Load Secret Service Button */}
        <AnimatePresence>
          {backdoorFound && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <motion.button
                onClick={loadSecretService}
                disabled={loading}
                className="w-full bg-green-500/20 text-green-400 rounded-lg px-4 py-3 flex items-center justify-center space-x-2 hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
                <span>{loading ? 'Loading...' : 'Load Secret Service'}</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
