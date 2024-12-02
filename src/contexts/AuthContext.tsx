import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/user';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const updatePreferences = (preferences: Partial<User['preferences']>) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      preferences: { ...user.preferences, ...preferences }
    };

    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    // Update user in the users list as well
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((u: User) =>
      u.id === user.id ? updatedUser : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const logActivity = (userId: string, type: string, metadata?: any) => {
    const activities = JSON.parse(localStorage.getItem(`activities_${userId}`) || '[]');
    activities.unshift({
      id: crypto.randomUUID(),
      userId,
      type,
      timestamp: new Date().toISOString(),
      metadata
    });
    localStorage.setItem(`activities_${userId}`, JSON.stringify(activities));
  };

  const impersonateUser = (userId: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const targetUser = users.find((u: User) => u.id === userId);
    if (targetUser) {
      setImpersonatedUser(targetUser);
      toast.success(`Now viewing ${targetUser.displayName}'s session`);
    }
  };

  const stopImpersonating = () => {
    setImpersonatedUser(null);
    toast.success('Stopped viewing session');
  };

  const login = async (agentId: string, password: string) => {
    try {
      if (agentId === '$guest_mode' && !password) {
        const guestUser: User = {
          id: 'guest',
          agentId: 'guest',
          displayName: 'Guest User',
          isCEO: false,
          roles: [],
          isGuest: true,
          stats: {
            postsCount: 0,
            likesReceived: 0,
            likesGiven: 0,
            lastActive: new Date().toISOString(),
            joinDate: new Date().toISOString(),
            achievementsUnlocked: []
          },
          preferences: {
            theme: 'dark',
            fontSize: 'medium'
          }
        };
        setUser(guestUser);
        localStorage.setItem('user', JSON.stringify(guestUser));
        toast.success('Welcome, Guest');
        return;
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: User) => u.agentId.toLowerCase() === agentId.toLowerCase());
      
      if (!user || password !== localStorage.getItem(`password_${agentId.toLowerCase()}`)) {
        throw new Error('Invalid credentials');
      }

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      logActivity(user.id, 'LOGIN');
      toast.success('Welcome back, Agent');
    } catch (error) {
      toast.error('Authentication failed');
      throw error;
    }
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const normalizedAgentId = userData.agentId!.toLowerCase();
      
      const exists = users.some((u: User) => u.agentId.toLowerCase() === normalizedAgentId);
      
      if (exists) {
        throw new Error('Agent ID already exists');
      }

      if (normalizedAgentId === 'rune') {
        const ceoExists = users.some((u: User) => u.isCEO);
        if (ceoExists) {
          throw new Error('CEO account already exists');
        }
        if (userData.password !== 'Yerandy2025') {
          throw new Error('Invalid credentials for administrator account');
        }
      }

      const newUser: User = {
        id: crypto.randomUUID(),
        agentId: userData.agentId!,
        displayName: userData.displayName || userData.agentId!,
        avatar: userData.avatar,
        about: userData.about || '',
        isCEO: normalizedAgentId === 'rune',
        lastDisplayNameChange: new Date().toISOString(),
        roles: [],
        stats: {
          postsCount: 0,
          likesReceived: 0,
          likesGiven: 0,
          lastActive: new Date().toISOString(),
          joinDate: new Date().toISOString(),
          achievementsUnlocked: []
        },
        preferences: {
          theme: 'dark',
          fontSize: 'medium'
        }
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem(`password_${normalizedAgentId}`, userData.password);
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      logActivity(newUser.id, 'REGISTER');
      toast.success(newUser.isCEO ? 'Welcome, Administrator' : 'Welcome to the agency, Agent');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    if (user) {
      logActivity(user.id, 'LOGOUT');
    }
    setUser(null);
    setImpersonatedUser(null);
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const theme = impersonatedUser?.preferences.theme || user?.preferences.theme || 'dark';

  return (
    <AuthContext.Provider value={{ 
      user: impersonatedUser || user,
      actualUser: user,
      impersonatedUser,
      impersonateUser,
      stopImpersonating,
      login,
      register,
      logout,
      isAuthenticated: !!(impersonatedUser || user),
      updatePreferences,
      theme
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
