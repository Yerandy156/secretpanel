import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import HoldButton from './HoldButton';
import { Upload, UserPlus, LogIn, Terminal, Loader2, AlertCircle, KeyRound, UserCircle } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
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
    if (!agentId || (!isLogin && !password)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        if (agentId.toLowerCase() === 'admin' && !password) {
          setShowCommandLine(true);
          return;
        }
        await login(agentId, password);
      } else {
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
    } finally {
      setLoading(false);
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
          <div className="flex items-center justify-between mb-4 text-purple-400">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5" />
              <span className="font-mono">SecureNexus Terminal v2.0</span>
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
      className="w-full max-w-md"
    >
      <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 text-center border-b border-purple-500/20 bg-purple-500/5">
          <motion.div
            initial={false}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5, times: [0, 0.5, 1] }}
            className="w-16 h-16 bg-purple-500/20 rounded-2xl mx-auto flex items-center justify-center mb-4"
          >
            {isLogin ? (
              <KeyRound className="w-8 h-8 text-purple-400" />
            ) : (
              <UserCircle className="w-8 h-8 text-purple-400" />
            )}
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-1">
            {isLogin ? 'Agent Authentication' : 'Agent Registration'}
          </h2>
          <p className="text-gray-400">
            {isLogin ? 'Access your secure console' : 'Join the agency network'}
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-400 mb-1">Agent ID</label>
              <input
                type="text"
                placeholder="Enter your agent ID"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="w-full p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              />
            </div>

            {(isLogin || (!isLogin && agentId)) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-purple-400 mb-1">Access Code</label>
                  <input
                    type="password"
                    placeholder="Enter your access code"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
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
                        <label className="block text-sm font-medium text-purple-400 mb-1">Display Name</label>
                        <input
                          type="text"
                          placeholder="How should we identify you?"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-purple-400 mb-1">About Me</label>
                        <textarea
                          placeholder="Tell us about yourself"
                          value={about}
                          onChange={(e) => setAbout(e.target.value)}
                          className="w-full p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-purple-400 mb-1">Avatar</label>
                        <div
                          {...getRootProps()}
                          className="border-2 border-dashed border-purple-500/20 rounded-xl p-4 text-center cursor-pointer hover:border-purple-500/40 transition-colors bg-purple-500/5"
                        >
                          <input {...getInputProps()} />
                          {avatar ? (
                            <img src={avatar} alt="Preview" className="w-20 h-20 mx-auto rounded-full object-cover" />
                          ) : (
                            <div className="text-purple-400 flex flex-col items-center">
                              <Upload className="w-6 h-6 mb-2" />
                              <span>Upload Avatar</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          <HoldButton
            onComplete={handleSubmit}
            disabled={loading}
            className="w-full p-3 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-xl font-medium transition-colors relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center space-x-2">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {isLogin ? (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Hold to Authenticate</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Hold to Register</span>
                    </>
                  )}
                </>
              )}
            </span>
          </HoldButton>

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full mt-4 text-gray-400 hover:text-purple-400 font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {isLogin ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>New Agent? Register Now</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Existing Agent? Login</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
