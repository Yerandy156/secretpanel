import { useState, useEffect } from 'react';
import { RefreshCcw, RotateCcw } from 'lucide-react';
import { AdminLog } from '../../types/user';
import toast from 'react-hot-toast';

export default function LogViewer() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    const storedLogs = JSON.parse(localStorage.getItem('adminLogs') || '[]');
    setLogs(storedLogs);
  };

  const handleRevert = async (log: AdminLog) => {
    if (log.action === 'DELETE_POST') {
      const posts = JSON.parse(localStorage.getItem('posts') || '[]');
      const deletedPost = log.metadata;
      if (deletedPost) {
        posts.unshift(deletedPost);
        localStorage.setItem('posts', JSON.stringify(posts));
        window.dispatchEvent(new Event('postsUpdated'));
        toast.success('Post restored successfully');
      }
    } else if (log.action === 'DELETE_USER') {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((u: any) =>
        u.id === log.targetId
          ? { ...u, deletedAt: undefined, deletedBy: undefined }
          : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      toast.success('User restored successfully');
    }
    
    // Add revert log
    const newLog: AdminLog = {
      id: crypto.randomUUID(),
      adminId: JSON.parse(localStorage.getItem('user') || '{}').id,
      adminName: JSON.parse(localStorage.getItem('user') || '{}').displayName,
      action: log.action === 'DELETE_POST' ? 'RESTORE_POST' : 'RESTORE_USER',
      targetId: log.targetId,
      targetType: log.targetType,
      timestamp: new Date().toISOString(),
      metadata: log.metadata
    };
    
    const updatedLogs = [newLog, ...logs];
    localStorage.setItem('adminLogs', JSON.stringify(updatedLogs));
    setLogs(updatedLogs);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'DELETE_USER':
      case 'DELETE_POST':
        return 'text-red-400';
      case 'RESTORE_USER':
      case 'RESTORE_POST':
        return 'text-green-400';
      case 'CREATE_ROLE':
      case 'UPDATE_ROLE':
      case 'DELETE_ROLE':
        return 'text-purple-400';
      default:
        return 'text-blue-400';
    }
  };

  const formatAction = (action: string) => {
    return action.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  };

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.action.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-700 text-white rounded px-3 py-1 text-sm"
          >
            <option value="all">All Actions</option>
            <option value="delete">Deletions</option>
            <option value="restore">Restorations</option>
            <option value="role">Role Changes</option>
          </select>
        </div>
        <button
          onClick={loadLogs}
          className="p-2 text-gray-400 hover:text-purple-400 rounded-full hover:bg-purple-500/20"
        >
          <RefreshCcw size={16} />
        </button>
      </div>

      <div className="space-y-2">
        {filteredLogs.map(log => (
          <div key={log.id} className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{log.adminName}</span>
                  <span className={`text-sm ${getActionColor(log.action)}`}>
                    {formatAction(log.action)}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
              {(log.action === 'DELETE_POST' || log.action === 'DELETE_USER') && (
                <button
                  onClick={() => handleRevert(log)}
                  className="p-2 text-gray-400 hover:text-green-400 rounded-full hover:bg-green-500/20"
                  title="Revert this action"
                >
                  <RotateCcw size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredLogs.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No logs found.
          </div>
        )}
      </div>
    </div>
  );
}
