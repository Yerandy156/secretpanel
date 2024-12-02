import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/user';
import { db, auth } from '../config/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | null>(null);

const INITIAL_USER: User = {
  id: "rune-1234-5678",
  agentId: "rune",
  displayName: "Rune",
  isCEO: true,
  roles: [],
  stats: {
    postsCount: 1,
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Initialize Rune account if it doesn't exist
    const initializeRune = async () => {
      try {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const runeExists = storedUsers.some((u: User) => u.id === INITIAL_USER.id);
        
        if (!runeExists) {
          localStorage.setItem('users', JSON.stringify([...storedUsers, INITIAL_USER]));
        }
        
        setAuthInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Rune account:', error);
        setAuthInitialized(true); // Set to true even on error to prevent infinite loading
      }
    };

    initializeRune();
  }, []);

  useEffect(() => {
    if (!authInitialized) return;

    // Try to restore user session from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, [authInitialized]);

  const login = async (agentId: string, password: string) => {
    try {
      setLoading(true);
      
      // Special case for guest mode
      if (agentId === '$guest_mode') {
        const guestUser: User = {
          id: 'guest',
          agentId: 'guest',
          displayName: 'Guest User',
          isCEO: false,
          isGuest: true,
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
        setUser(guestUser);
        localStorage.setItem('user', JSON.stringify(guestUser));
        toast.success('Welcome, Guest');
        return;
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find((u: User) => u.agentId.toLowerCase() === agentId.toLowerCase());
      
      if (!foundUser) {
        throw new Error('User not found');
      }

      const storedPassword = localStorage.getItem(`password_${agentId.toLowerCase()}`);
      if (storedPassword !== password && !(agentId.toLowerCase() === 'rune' && !password)) {
        throw new Error('Invalid password');
      }

      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      toast.success('Welcome back, Agent');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    try {
      setLoading(true);
      const normalizedAgentId = userData.agentId!.toLowerCase();
      
      // Check if agent ID exists
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userExists = users.some((u: User) => 
        u.agentId.toLowerCase() === normalizedAgentId || 
        normalizedAgentId === 'rune'
      );
      
      if (userExists) {
        throw new Error('Agent ID already exists');
      }

      const newUser: User = {
        id: crypto.randomUUID(),
        agentId: userData.agentId!,
        displayName: userData.displayName || userData.agentId!,
        avatar: userData.avatar,
        about: userData.about || '',
        isCEO: false,
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

      // Store password separately
      localStorage.setItem(`password_${normalizedAgentId}`, userData.password);
      
      // Update users array
      localStorage.setItem('users', JSON.stringify([...users, newUser]));
      
      // Set current user
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast.success('Welcome to the agency, Agent');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setImpersonatedUser(null);
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const impersonateUser = (userId: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const targetUser = users.find((u: User) => u.id === userId);
    if (targetUser) {
      setImpersonatedUser(targetUser);
      toast.success(`Now viewing as ${targetUser.displayName}`);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user: impersonatedUser || user,
      actualUser: user,
      impersonatedUser,
      impersonateUser,
      stopImpersonating: () => setImpersonatedUser(null),
      login,
      register,
      logout,
      isAuthenticated: !!(impersonatedUser || user),
      loading: loading || !authInitialized,
      updatePreferences: () => {},
      theme: 'dark'
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
