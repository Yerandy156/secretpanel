import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save } from 'lucide-react';
import { Role } from '../../types/user';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function RoleManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: '',
    color: '#9333ea',
    permissions: []
  });
  const { user } = useAuth();

  useEffect(() => {
    const storedRoles = JSON.parse(localStorage.getItem('roles') || '[]');
    setRoles(storedRoles);
  }, []);

  const saveRoles = (updatedRoles: Role[]) => {
    localStorage.setItem('roles', JSON.stringify(updatedRoles));
    setRoles(updatedRoles);
  };

  const logAction = (action: 'CREATE_ROLE' | 'UPDATE_ROLE' | 'DELETE_ROLE', roleId: string) => {
    const logs = JSON.parse(localStorage.getItem('adminLogs') || '[]');
    logs.unshift({
      id: crypto.randomUUID(),
      adminId: user?.id,
      adminName: user?.displayName,
      action,
      targetId: roleId,
      targetType: 'ROLE',
      timestamp: new Date().toISOString(),
      metadata: roles.find(r => r.id === roleId)
    });
    localStorage.setItem('adminLogs', JSON.stringify(logs));
  };

  const handleCreateRole = () => {
    if (!newRole.name) return;

    const role: Role = {
      id: crypto.randomUUID(),
      name: newRole.name,
      color: newRole.color || '#9333ea',
      permissions: [],
      position: roles.length,
      createdAt: new Date().toISOString(),
      createdBy: user?.id || ''
    };

    const updatedRoles = [...roles, role];
    saveRoles(updatedRoles);
    logAction('CREATE_ROLE', role.id);
    setNewRole({ name: '', color: '#9333ea', permissions: [] });
    toast.success('Role created successfully');
  };

  const handleUpdateRole = () => {
    if (!editingRole) return;

    const updatedRoles = roles.map(role =>
      role.id === editingRole.id ? editingRole : role
    );
    saveRoles(updatedRoles);
    logAction('UPDATE_ROLE', editingRole.id);
    setEditingRole(null);
    toast.success('Role updated successfully');
  };

  const handleDeleteRole = (roleId: string) => {
    const updatedRoles = roles.filter(role => role.id !== roleId);
    saveRoles(updatedRoles);
    logAction('DELETE_ROLE', roleId);
    toast.success('Role deleted successfully');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
        <h3 className="text-lg font-semibold">Create New Role</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Role Name</label>
            <input
              type="text"
              value={newRole.name}
              onChange={e => setNewRole({ ...newRole, name: e.target.value })}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              placeholder="Enter role name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Role Color</label>
            <input
              type="color"
              value={newRole.color}
              onChange={e => setNewRole({ ...newRole, color: e.target.value })}
              className="w-full p-1 bg-gray-700 rounded border border-gray-600"
            />
          </div>
          <button
            onClick={handleCreateRole}
            disabled={!newRole.name}
            className="w-full p-2 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Plus size={16} />
            <span>Create Role</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Existing Roles</h3>
        {roles.map(role => (
          <div key={role.id} className="bg-gray-800/50 rounded-lg p-4 space-y-4">
            {editingRole?.id === role.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editingRole.name}
                  onChange={e => setEditingRole({ ...editingRole, name: e.target.value })}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
                />
                <input
                  type="color"
                  value={editingRole.color}
                  onChange={e => setEditingRole({ ...editingRole, color: e.target.value })}
                  className="w-full p-1 bg-gray-700 rounded border border-gray-600"
                />
                <button
                  onClick={handleUpdateRole}
                  className="w-full p-2 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 flex items-center justify-center space-x-2"
                >
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: role.color }}
                  />
                  <span className="font-medium">{role.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingRole(role)}
                    className="p-2 text-gray-400 hover:text-purple-400 rounded-full hover:bg-purple-500/20"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role.id)}
                    className="p-2 text-gray-400 hover:text-red-400 rounded-full hover:bg-red-500/20"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {roles.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No roles created yet.
          </div>
        )}
      </div>
    </div>
  );
}
