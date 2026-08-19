import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { UserProfile, UserRole } from '../types';
import { INITIAL_USERS } from '../services/sampleData';
import { DataService } from '../services/dataService';

interface AuthContextType {
  currentUser: UserProfile;
  firebaseUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  switchUser: (user: UserProfile) => void;
  logout: () => Promise<void>;
  
  // Permissions
  isITManager: boolean;
  isITSupport: boolean;
  canManageUsers: boolean;
  canRetireAsset: boolean;
  canScrapAsset: boolean;
  canEditAsset: boolean;
  canAddService: boolean;
  canImportData: boolean;
  canModifySettings: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default to Sameer Tupe (IT Manager) for instant rich testing, or remembered profile
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('ag_active_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_USERS[0]; // Sameer Tupe (IT Manager)
  });

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user && user.email) {
        // Find or map user profile
        const allUsers = await DataService.getUsers();
        let matched = allUsers.find((u) => u.email.toLowerCase() === user.email?.toLowerCase());

        if (!matched) {
          // If the signed in email is rahulprashad7@gmail.com, map to Rahul Prasad or IT Manager
          const isRahul = user.email.toLowerCase().includes('rahulprashad7') || user.email.toLowerCase().includes('rahul');
          const isSameer = user.email.toLowerCase().includes('sameer') || user.email.toLowerCase().includes('admin');
          
          matched = {
            id: user.uid,
            email: user.email,
            name: user.displayName || (isRahul ? 'Rahul Prasad' : isSameer ? 'Sameer Tupe' : 'IT Staff'),
            role: isRahul ? 'IT_SUPPORT' : 'IT_MANAGER',
            designation: isRahul ? 'IT Support Specialist' : 'IT Manager',
            organization: 'ALL',
            avatarUrl: user.photoURL || undefined,
            lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19),
          };
          await DataService.saveUser(matched, matched);
        }
        setCurrentUser(matched);
        localStorage.setItem('ag_active_user', JSON.stringify(matched));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const switchUser = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('ag_active_user', JSON.stringify(user));
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign In Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Logout error:', e);
    }
    // Switch to Rahul Prasad or default
    switchUser(INITIAL_USERS[0]);
  };

  const login = async (email: string, _pass: string) => {
    setLoading(true);
    try {
      const allUsers = await DataService.getUsers();
      const matched = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        switchUser(matched);
      } else {
        // Create basic profile
        const isManager = email.toLowerCase().includes('sameer') || email.toLowerCase().includes('admin');
        const newProfile: UserProfile = {
          id: `usr-${Date.now()}`,
          email,
          name: email.split('@')[0],
          role: isManager ? 'IT_MANAGER' : 'IT_SUPPORT',
          designation: isManager ? 'IT Manager' : 'IT Support Engineer',
          organization: 'ALL',
          lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        await DataService.saveUser(newProfile, newProfile);
        switchUser(newProfile);
      }
    } finally {
      setLoading(false);
    }
  };

  const isITManager = currentUser.role === 'IT_MANAGER';
  const isITSupport = currentUser.role === 'IT_SUPPORT';

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    loading,
    isAuthenticated: Boolean(currentUser && currentUser.id),
    isAuthLoading: loading,
    login,
    signInWithGoogle,
    switchUser,
    logout,
    isITManager,
    isITSupport,
    canManageUsers: isITManager,
    canRetireAsset: isITManager || isITSupport,
    canScrapAsset: isITManager,
    canEditAsset: isITManager || isITSupport,
    canAddService: isITManager || isITSupport,
    canImportData: isITManager || isITSupport,
    canModifySettings: isITManager,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
