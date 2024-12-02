import { useState, useEffect } from 'react';
import { Trash2, Eye, EyeOff, Shield, Ban, Activity, Award } from 'lucide-react';
import { User, Role, UserActivity } from '../../types/user';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface UserActivityLog {
  activities: UserActivity[];
  stats: {
    totalPosts: number;
    totalLogins: number;
    lastActive: string;
  }
}

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<UserActivityLog | null>(null);
  const { user: currentUser, impersonateUser, impersonatedUser, stopImpersonating } = useAuth();

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const storedRoles = JSON.parse(localStorage.getItem('roles') || '[]');
    setUsers(storedUsers);
    setRoles(storedRoles);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      const activities = JSON.parse(localStorage.getItem(`activities_${selectedUser}`) || '[]');
      const stats = {
        totalPosts: activities.filter((a: UserActivity) => a.type === 'POST_CREATED').length,
        totalLogins: activities.filter((a: UserActivity) => a.type === 'LOGIN').length,
        lastActive: activities[0]?.timestamp || 'Never'
      };
      setActivityLog({ activities, stats });
    }
  }, [selectedUser]);

  const logAction = (action: string, targetId: string, metadata?: any) => {
    const logs = JSON.parse(localStorage.getItem('adminLogs') || '[]');
    logs.unshift({
      id: crypto.randomUUID(),
      adminId: currentUser?.id,
      adminName: currentUser?.displayName,
      action,
      targetId,
      targetType: 'USER',
      timestamp: new Date().toISOString(),
      metadata
    });
    localStorage.setItem('adminLogs', JSON.stringify(logs));
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error("You can't delete your own account");
      return;
    }

    const updatedUsers = users.map(u =>
      u.id === userId
        ? { ...u, deletedAt: new Date().toISOString(), deletedBy: currentUser?.id }
        : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    logAction('DELETE_USER', userId);
    toast.success('User deleted successfully');
  };

  const toggleShadowBan = (userId: string) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        const isBanned = !u.shadowBanned;
        return {
          ...u,
          shadowBanned: isBanned,
          shadowBannedBy: isBanned ? currentUser?.id : undefined,
          shadowBannedAt: isBanned ? new Date().toISOString() : undefined
        };
      }
      return u;
    });

    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    logAction(
      updatedUsers.find(u => u.id === userId)?.shadowBanned ? 'SHADOW_BAN' : 'REMOVE_SHADOW_BAN',
      userId
    );
    toast.success(
      updatedUsers.find(u => u.id === userId)?.shadowBanned
        ? 'User has been shadow banned'
        : 'Shadow ban has been removed'
    );
  };

  const grantAchievement = (userId: string) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        const newAchievement = {
          id: crypto.randomUUID(),
          name: 'Elite Contributor',
          description: 'Recognized for exceptional contributions to the community',
          icon: '🌟',
          unlockedAt: new Date().toISOString()
        };
        
        return {
          ...u,
          stats: {
            ...u.stats,
            achievementsUnlocked: [...(u.stats.achievementsUnlocked || []), newAchievement]
          }
        };
      }
      return u;
    });

    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    logAction('ACHIEVEMENT_GRANTED', userId);
    toast.success('Achievement granted successfully');
  };

  return (
    <div className="space-y-4">
      {users.map(u => (
        <div key={u.id} className="bg-gray-800/50 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {u.avatar ? (
                <img src={u.avatar} alt="profile" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-xl">{u.displayName[0]}</span>
                </div>
              )}
              <div>
                <div className="font-medium flex items-center space-x-2">
                  <span>{u.displayName}</span>
                  {u.shadowBanned && (
                    <span className="text-yellow-500 text-sm">(Shadow Banned)</span>
                  )}
                </div>
                <div className="text-sm text-gray-400">@{u.agentId}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedUser(selectedUser === u.id ? null : u.id)}
                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-full"
                title="View activity"
              >
                <Activity size={16} />
              </button>

              {!u.isCEO && (
                <>
                  <button
                    onClick={() => toggleShadowBan(u.id)}
                    className={`p-2 rounded-full ${
                      u.shadowBanned
                        ? 'text-yellow-400 hover:bg-yellow-500/20'
                        : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/20'
                    }`}
                    title={u.shadowBanned ? 'Remove shadow ban' : 'Shadow ban user'}
                  >
                    <Ban size={16} />
                  </button>

                  <button
                    onClick={() => grantAchievement(u.id)}
                    className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/20 rounded-full"
                    title="Grant achievement"
                  >
                    <Award size={16} />
                  </button>
                </>
              )}

              {impersonatedUser?.id === u.id ? (
                <button
                  onClick={stopImpersonating}
                  className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-full"
                  title="Stop viewing"
                >
                  <EyeOff size={16} />
                </button>
              ) : (
                <button
                  onClick={() => impersonateUser(u.id)}
                  className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-full"
                  title="View user's session"
                >
                  <Eye size={16} />
                </button>
              )}

              {!u.isCEO && (
                <button
                  onClick={() => handleDeleteUser(u.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-full"
                  title="Delete user"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {selectedUser === u.id && activityLog && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-4"
              >
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Total Posts</div>
                    <div className="text-2xl font-bold">{activityLog.stats.totalPosts}</div>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Total Logins</div>
                    <div className="text-2xl font-bold">{activityLog.stats.totalLogins}</div>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Last Active</div>
                    <div className="text-lg font-bold">
                      {new Date(activityLog.stats.lastActive).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-2">
                    {activityLog.activities.slice(0, 5).map((activity) => (
                      <div
                        key={activity.id}
                        className="text-sm text-gray-400 flex items-center justify-between"
                      >
                        <span>{activity.type.replace(/_/g, ' ')}</span>
                        <span>{new Date(activity.timestamp).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {u.stats.achievementsUnlocked?.length > 0 && (
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Achievements</h3>
                    <div className="flex flex-wrap gap-2">
                      {u.stats.achievementsUnlocked.map((achievement) => (
                        <div
                          key={achievement.id}
                          className="flex items-center space-x-2 bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full"
                        >
                          <span>{achievement.icon}</span>
                          <span>{achievement.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
