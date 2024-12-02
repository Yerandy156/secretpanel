import { useState, useEffect } from 'react';
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

  const gradientStyle = {
    background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgb(88, 28, 135), rgb(45, 14, 69), rgb(15, 5, 23))`,
    transition: 'background 0.3s ease',
  };

  if (showCommandLine) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <div className="w-full max-w-3xl">
          <CommandLine onClose={() => setShowCommandLine(false)} />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden p-4">
      <div 
        className="absolute inset-0 w-full h-full" 
        style={gradientStyle}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl relative z-10"
      >
        <motion.div
          className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="p-8 text-center border-b border-white/10">
            <motion.div
              initial={false}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5, times: [0, 0.5, 1] }}
              className="w-24 h-24 bg-purple-500/20 rounded-2xl mx-auto flex items-center justify-center mb-6"
            >
              {isLogin ? (
                <KeyRound className="w-12 h-12 text-purple-400" />
              ) : (
                <UserCircle className="w-12 h-12 text-purple-400" />
              )}
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back Agent' : 'Join The Network'}
            </h2>
            <p className="text-gray-400 text-lg">
              {isLogin ? 'Access your secure console' : 'Begin your journey'}
            </p>
          </div>

          <div className="p-8 space-y-6">
            {/* Form fields... */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-purple-400 mb-2">Agent ID</label>
                <input
                  type="text"
                  placeholder="Enter your agent ID"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className="w-full p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-lg"
                />
              </div>

              {(isLogin || (!isLogin && agentId)) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-purple-400 mb-2">Access Code</label>
                    <input
                      type="password"
                      placeholder="Enter your access code"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-lg"
                    />
                  </div>

                  <AnimatePresence>
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6"
                      >
                        {/* Registration fields... */}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            <HoldButton
              onComplete={handleSubmit}
              disabled={loading}
              className="w-full p-4 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-xl font-medium transition-colors relative overflow-hidden group text-lg"
              duration={1500}
            >
              <span className="relative z-10 flex items-center justify-center space-x-2">
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {isLogin ? (
                      <>
                        <LogIn className="w-6 h-6" />
                        <span>Hold to Authenticate</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-6 h-6" />
                        <span>Hold to Register</span>
                      </>
                    )}
                  </>
                )}
              </span>
            </HoldButton>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="w-full mt-4 text-gray-400 hover:text-purple-400 font-medium transition-colors flex items-center justify-center space-x-2 text-lg"
            >
              {isLogin ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>New Agent? Register Now</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Existing Agent? Login</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
