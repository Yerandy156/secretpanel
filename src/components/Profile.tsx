import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Edit2, Lock, Trash2, AlertCircle, Check, X, Hash, Globe2 } from 'lucide-react';
import PostList from './PostList';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import AdminBadge from './AdminBadge';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileProps {
  userId: string;
  onPostClick: (userId: string) => void;
}

interface ProfileCustomization {
  accentColor: string;
  bioLayout: 'standard' | 'centered' | 'minimal';
  showActivity: boolean;
  status?: string;
  statusEmoji?: string;
  location?: string;
}

const DEFAULT_CUSTOMIZATION: ProfileCustomization = {
  accentColor: '#9333ea',
  bioLayout: 'standard',
  showActivity: true,
  status: '',
  statusEmoji: '👋',
  location: ''
};

export default function Profile({ userId, onPostClick }: ProfileProps) {
  const { user: currentUser, logout } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newAbout, setNewAbout] = useState('');
  const [banner, setBanner] = useState<string>('');
  const [customization, setCustomization] = useState<ProfileCustomization>(DEFAULT_CUSTOMIZATION);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const canEdit = currentUser?.id === userId;

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find((u: any) => u.id === userId);
    const storedRoles = JSON.parse(localStorage.getItem('roles') || '[]');
    
    if (foundUser) {
      setUser(foundUser);
      setNewDisplayName(foundUser.displayName);
      setNewAbout(foundUser.about || '');
      setBanner(foundUser.banner || '');
      setCustomization(foundUser.customization || DEFAULT_CUSTOMIZATION);

      const userRoles = storedRoles.filter((role: any) => 
        foundUser.roles?.includes(role.id)
      );
      setRoles(userRoles);
    }
  }, [userId]);

  const { getRootProps: getBannerProps, getInputProps: getBannerInput } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setBanner(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  });

  const { getRootProps: getAvatarProps, getInputProps: getAvatarInput } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUser({ avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  });

  const updateUser = (updates: any) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((u: any) => 
      u.id === userId ? { ...u, ...updates } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    const updatedUser = updatedUsers.find((u: any) => u.id === userId);
    setUser(updatedUser);
    if (currentUser?.id === userId) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const handleSave = () => {
    if (newDisplayName !== user.displayName) {
      const lastChange = new Date(user.lastDisplayNameChange || 0);
      const daysSinceChange = (Date.now() - lastChange.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceChange < 30) {
        toast.error('You can only change your display name once every 30 days');
        return;
      }
    }

    updateUser({
      displayName: newDisplayName,
      about: newAbout,
      banner,
      customization,
      lastDisplayNameChange: newDisplayName !== user.displayName ? new Date().toISOString() : user.lastDisplayNameChange
    });
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handlePasswordChange = () => {
    const storedPassword = localStorage.getItem(`password_${user.agentId.toLowerCase()}`);
    
    if (currentPassword !== storedPassword) {
      toast.error('Current password is incorrect');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    localStorage.setItem(`password_${user.agentId.toLowerCase()}`, newPassword);
    setShowPasswordChange(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Password updated successfully');
  };

  const handleDeleteAccount = () => {
    if (user.agentId.toLowerCase() === 'rune') {
      toast.error('The Rune account cannot be deleted');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.filter((u: any) => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.removeItem(`password_${user.agentId.toLowerCase()}`);
    toast.success('Account deleted successfully');
    logout();
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Banner */}
      <motion.div 
        className="h-48 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {canEdit && isEditing ? (
          <div
            {...getBannerProps()}
            className="absolute inset-0 flex items-center justify-center bg-gray-800 cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <input {...getBannerInput()} />
            <Camera className="w-8 h-8" />
          </div>
        ) : (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: banner ? `url(${banner})` : `linear-gradient(to right, ${customization.accentColor}20, ${customization.accentColor}40)`
            }}
          />
        )}
      </motion.div>

      {/* Profile Info */}
      <div className="px-4 pb-4">
        <motion.div 
          className="relative -mt-16 mb-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {canEdit && isEditing ? (
            <div
              {...getAvatarProps()}
              className="w-32 h-32 rounded-full border-4 border-gray-900 cursor-pointer overflow-hidden bg-gray-800 flex items-center justify-center"
              style={{ borderColor: customization.accentColor }}
            >
              <input {...getAvatarInput()} />
              <Camera className="w-8 h-8" />
            </div>
          ) : (
            <div 
              className="w-32 h-32 rounded-full border-4 border-gray-900 overflow-hidden bg-gray-800"
              style={{ borderColor: customization.accentColor }}
            >
              {user.avatar ? (
                <img src={user.avatar} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">
                  {user.displayName[0]}
                </div>
              )}
            </div>
          )}
        </motion.div>

        <motion.div 
          className="space-y-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="bg-gray-800 px-3 py-1 rounded"
                    style={{ borderColor: customization.accentColor }}
                  />
                ) : (
                  <h1 className="text-2xl font-bold flex items-center space-x-2">
                    <span>{user.displayName}</span>
                    {user.isCEO && <AdminBadge className="ml-2" />}
                  </h1>
                )}
              </div>
              <p className="text-gray-500">@{user.agentId}</p>
              {customization.status && (
                <div className="mt-2 flex items-center space-x-2 text-gray-400">
                  <span>{customization.statusEmoji}</span>
                  <span>{customization.status}</span>
                </div>
              )}
              {customization.location && (
                <div className="mt-1 flex items-center space-x-2 text-gray-400">
                  <Globe2 size={14} />
                  <span>{customization.location}</span>
                </div>
              )}
              {roles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {roles.map((role: any) => (
                    <span
                      key={role.id}
                      className="px-2 py-1 rounded-full text-sm"
                      style={{ 
                        backgroundColor: `${role.color}20`, 
                        color: role.color,
                        border: `1px solid ${role.color}40`
                      }}
                    >
                      {role.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              {canEdit && (
                <>
                  <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors flex items-center space-x-2"
                    style={{ 
                      backgroundColor: `${customization.accentColor}20`,
                      color: customization.accentColor
                    }}
                  >
                    <Edit2 size={16} />
                    <span>{isEditing ? 'Save' : 'Edit Profile'}</span>
                  </button>
                  <button
                    onClick={() => setShowPasswordChange(true)}
                    className="w-full px-4 py-2 rounded-full bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-colors flex items-center space-x-2"
                  >
                    <Lock size={16} />
                    <span>Change Password</span>
                  </button>
                  {!user.isCEO && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full px-4 py-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center space-x-2"
                    >
                      <Trash2 size={16} />
                      <span>Delete Account</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {isEditing && (
            <motion.div 
              className="space-y-4 bg-gray-800/50 rounded-lg p-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Accent Color</label>
                <input
                  type="color"
                  value={customization.accentColor}
                  onChange={(e) => setCustomization({ ...customization, accentColor: e.target.value })}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Bio Layout</label>
                <select
                  value={customization.bioLayout}
                  onChange={(e) => setCustomization({ ...customization, bioLayout: e.target.value as any })}
                  className="w-full bg-gray-700 rounded p-2"
                >
                  <option value="standard">Standard</option>
                  <option value="centered">Centered</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={customization.statusEmoji}
                    onChange={(e) => setCustomization({ ...customization, statusEmoji: e.target.value })}
                    className="w-16 bg-gray-700 rounded p-2"
                    placeholder="😊"
                  />
                  <input
                    type="text"
                    value={customization.status}
                    onChange={(e) => setCustomization({ ...customization, status: e.target.value })}
                    className="flex-1 bg-gray-700 rounded p-2"
                    placeholder="What's on your mind?"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                <input
                  type="text"
                  value={customization.location}
                  onChange={(e) => setCustomization({ ...customization, location: e.target.value })}
                  className="w-full bg-gray-700 rounded p-2"
                  placeholder="Where are you based?"
                />
              </div>
            </motion.div>
          )}

          <div className={`bg-gray-800/50 rounded-lg p-4 ${customization.bioLayout === 'centered' ? 'text-center' : ''}`}>
            <h2 className="text-lg font-semibold mb-2">About</h2>
            {isEditing ? (
              <textarea
                value={newAbout}
                onChange={(e) => setNewAbout(e.target.value)}
                className="w-full bg-gray-700 p-2 rounded"
                rows={3}
              />
            ) : (
              <p className={`text-gray-300 ${customization.bioLayout === 'minimal' ? 'text-sm' : ''}`}>
                {user.about || 'No bio yet.'}
              </p>
            )}
          </div>

          {!user.isGuest && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Posts</h2>
              <PostList filterUserId={userId} onProfileClick={onPostClick} />
            </div>
          )}
        </motion.div>
      </div>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordChange && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gray-800 rounded-lg p-6 max-w-md w-full"
            >
              <h2 className="text-xl font-bold mb-4">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-gray-700 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-700 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-700 rounded p-2"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowPasswordChange(false)}
                    className="px-4 py-2 rounded bg-gray-700 text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    className="px-4 py-2 rounded bg-purple-500 text-white"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gray-800 rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex items-center space-x-2 text-red-400 mb-4">
                <AlertCircle className="w-6 h-6" />
                <h2 className="text-xl font-bold">Delete Account</h2>
              </div>
              <p className="text-gray-300 mb-4">
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded bg-gray-700 text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 rounded bg-red-500 text-white flex items-center space-x-2"
                >
                  <Trash2 size={16} />
                  <span>Delete Account</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
