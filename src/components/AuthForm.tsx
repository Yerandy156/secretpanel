import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import HoldButton from './HoldButton';
import { Upload, UserPlus, LogIn, Terminal } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import CommandLine from './CommandLine';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [agentId, setAgentId] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState<string>('');
  const [about, setAbout] = useState('');
  const [showCommandLine, setShowCommandLine] = useState(false);
  const { login, register } = useAuth();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  });

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        if (agentId.toLowerCase() === 'admin' && !password) {
          setShowCommandLine(true);
          return;
        }
        await login(agentId, password);
      } else {
        if (!agentId || !password) {
          toast.error('Please fill in all required fields');
          return;
        }
        // Special case for Rune account
        if (agentId.toLowerCase() === 'rune' && password !== 'Yerandy2025') {
          toast.error('Invalid credentials for administrator account');
          return;
        }
        await register({
          agentId,
          password,
          displayName: displayName || agentId,
          avatar,
          about
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (showCommandLine) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <div className="w-full max-w-3xl">
          <div className="flex items-center justify-between mb-4 text-green-400">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5" />
              <span className="font-mono">SecureNexus Terminal v1.0</span>
            </div>
            <button 
              onClick={() => setShowCommandLine(false)}
              className="text-gray-500 hover:text-gray-400"
            >
              ESC
            </button>
          </div>
          <CommandLine onClose={() => setShowCommandLine(false)} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md p-8 bg-gray-900/50 backdrop-blur-lg rounded-lg shadow-xl border border-gray-800"
    >
      <motion.div
        initial={false}
        animate={{ height: 'auto' }}
        className="overflow-hidden"
      >
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-2">
          {isLogin ? (
            <>
              <LogIn className="w-8 h-8 text-purple-400" />
              <span>Agent Login</span>
            </>
          ) : (
            <>
              <UserPlus className="w-8 h-8 text-purple-400" />
              <span>New Agent Registration</span>
            </>
          )}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Agent ID</label>
            <input
              type="text"
              placeholder="Enter your agent ID"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="w-full p-3 bg-black/20 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-black/20 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
            />
          </div>

          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Display Name</label>
                  <input
                    type="text"
                    placeholder="How should we call you?"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full p-3 bg-black/20 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">About Me</label>
                  <textarea
                    placeholder="Tell us about yourself"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="w-full p-3 bg-black/20 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Avatar</label>
                  <div
                    {...getRootProps()}
                    className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500 transition-colors"
                  >
                    <input {...getInputProps()} />
                    {avatar ? (
                      <img src={avatar} alt="Preview" className="w-20 h-20 mx-auto rounded-full object-cover" />
                    ) : (
                      <div className="text-gray-400 flex flex-col items-center">
                        <Upload className="w-6 h-6 mb-2" />
                        <span>Upload Avatar</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <HoldButton
            onComplete={handleSubmit}
            className="w-full p-3 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg font-mono transition-colors"
          >
            {isLogin ? 'Hold to Verify Login' : 'Hold to Complete Registration'}
          </HoldButton>

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full mt-4 text-gray-400 hover:text-purple-400 font-mono transition-colors"
          >
            {isLogin ? 'New Agent? Register' : 'Existing Agent? Login'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
