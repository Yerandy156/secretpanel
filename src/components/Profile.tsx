import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Edit2 } from 'lucide-react';
import PostList from './PostList';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import AdminBadge from './AdminBadge';

interface ProfileProps {
  userId: string;
  onPostClick: (userId: string) => void;
}

export default function Profile({ userId, onPostClick }: ProfileProps) {
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newAbout, setNewAbout] = useState('');
  const [banner, setBanner] = useState<string>('');

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

      // Map role IDs to actual role objects
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
      lastDisplayNameChange: newDisplayName !== user.displayName ? new Date().toISOString() : user.lastDisplayNameChange
    });
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Banner */}
      <div className="h-48 relative">
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
              backgroundImage: banner ? `url(${banner})` : 'linear-gradient(to right, #4a5568, #2d3748)'
            }}
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="px-4 pb-4">
        <div className="relative -mt-16 mb-4">
          {canEdit && isEditing ? (
            <div
              {...getAvatarProps()}
              className="w-32 h-32 rounded-full border-4 border-gray-900 cursor-pointer overflow-hidden bg-gray-800 flex items-center justify-center"
            >
              <input {...getAvatarInput()} />
              <Camera className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full border-4 border-gray-900 overflow-hidden bg-gray-800">
              {user.avatar ? (
                <img src={user.avatar} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">
                  {user.displayName[0]}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="bg-gray-800 px-3 py-1 rounded"
                  />
                ) : (
                  <h1 className="text-2xl font-bold flex items-center space-x-2">
                    <span>{user.displayName}</span>
                    {user.isCEO && <AdminBadge className="ml-2" />}
                  </h1>
                )}
              </div>
              <p className="text-gray-500">@{user.agentId}</p>
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
            {canEdit && (
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors flex items-center space-x-2"
              >
                <Edit2 size={16} />
                <span>{isEditing ? 'Save' : 'Edit Profile'}</span>
              </button>
            )}
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">About</h2>
            {isEditing ? (
              <textarea
                value={newAbout}
                onChange={(e) => setNewAbout(e.target.value)}
                className="w-full bg-gray-800 p-2 rounded"
                rows={3}
              />
            ) : (
              <p className="text-gray-300">{user.about || 'No bio yet.'}</p>
            )}
          </div>

          {!user.isGuest && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Posts</h2>
              <PostList filterUserId={userId} onProfileClick={onPostClick} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
