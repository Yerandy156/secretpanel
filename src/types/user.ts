export interface Role {
  id: string;
  name: string;
  color: string;
  permissions: Permission[];
  position: number;
  createdAt: string;
  createdBy: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface UserStats {
  postsCount: number;
  likesReceived: number;
  likesGiven: number;
  lastActive: string;
  joinDate: string;
  achievementsUnlocked: Achievement[];
  moderationPoints?: number;
  reportsResolved?: number;
}

export interface User {
  id: string;
  agentId: string;
  displayName: string;
  avatar?: string;
  about?: string;
  lastDisplayNameChange?: string;
  isCEO: boolean;
  isGuest?: boolean;
  banner?: string;
  roles: string[];  // Array of role IDs
  deletedAt?: string;
  deletedBy?: string;
  shadowBanned?: boolean;
  shadowBannedBy?: string;
  shadowBannedAt?: string;
  stats: UserStats;
  preferences: {
    theme: 'dark' | 'light';
    fontSize: 'small' | 'medium' | 'large';
  };
}

export interface AdminLog {
  id: string;
  adminId: string;
  adminName: string;
  action: 'DELETE_USER' | 'RESTORE_USER' | 'DELETE_POST' | 'RESTORE_POST' | 'CREATE_ROLE' | 
          'UPDATE_ROLE' | 'DELETE_ROLE' | 'ASSIGN_ROLE' | 'REMOVE_ROLE' | 'SHADOW_BAN' |
          'REMOVE_SHADOW_BAN' | 'ACHIEVEMENT_GRANTED';
  targetId: string;
  targetType: 'USER' | 'POST' | 'ROLE' | 'ACHIEVEMENT';
  timestamp: string;
  metadata?: any;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'POST_CREATED' | 'POST_LIKED' | 'POST_DELETED' | 'LOGIN' | 'LOGOUT' | 'PROFILE_UPDATE';
  timestamp: string;
  metadata?: any;
}

export interface AuthContextType {
  user: User | null;
  actualUser: User | null;
  login: (agentId: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  impersonatedUser: User | null;
  impersonateUser: (userId: string) => void;
  stopImpersonating: () => void;
  updatePreferences: (preferences: Partial<User['preferences']>) => void;
  theme: 'dark' | 'light';
  loading: boolean;
}
