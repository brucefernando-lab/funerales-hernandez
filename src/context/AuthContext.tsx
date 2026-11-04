import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Branch, BranchId, UserRole } from '../types';
import { storage } from '../services/storage';

interface AuthContextType {
  currentUser: User;
  branches: Branch[];
  currentBranch: Branch;
  allUsers: User[];
  setCurrentUser: (user: User) => void;
  setCurrentBranchId: (branchId: BranchId) => void;
  switchDemoUser: (userId: string) => void;
  login: (email: string, role?: UserRole) => boolean;
  logout: () => void;
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User>(() => storage.getCurrentUser());
  const [branches, setBranches] = useState<Branch[]>(() => storage.getBranches());
  const [allUsers, setAllUsers] = useState<User[]>(() => storage.getUsers());
  const [selectedBranchId, setSelectedBranchId] = useState<BranchId>(() => storage.getCurrentUser().branch);

  const refreshUserData = () => {
    const user = storage.getCurrentUser();
    setCurrentUserState(user);
    setBranches(storage.getBranches());
    setAllUsers(storage.getUsers());
  };

  useEffect(() => {
    storage.initialize();
    refreshUserData();

    const handleStorageChange = () => {
      refreshUserData();
    };

    window.addEventListener('fh_storage_change', handleStorageChange);
    return () => window.removeEventListener('fh_storage_change', handleStorageChange);
  }, []);

  const setCurrentUser = (user: User) => {
    storage.setCurrentUser(user);
    setCurrentUserState(user);
    setSelectedBranchId(user.branch);
  };

  const setCurrentBranchId = (branchId: BranchId) => {
    setSelectedBranchId(branchId);
    if (currentUser.role === 'admin') {
      const updated = { ...currentUser, branch: branchId };
      storage.setCurrentUser(updated);
      setCurrentUserState(updated);
    }
  };

  const switchDemoUser = (userId: string) => {
    const target = allUsers.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  const login = (email: string): boolean => {
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    // Return to default Carlos or first user
    const first = allUsers[0];
    if (first) setCurrentUser(first);
  };

  const currentBranch = branches.find(b => b.id === (currentUser.role === 'admin' ? selectedBranchId : currentUser.branch)) || branches[0];

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        branches,
        currentBranch,
        allUsers,
        setCurrentUser,
        setCurrentBranchId,
        switchDemoUser,
        login,
        logout,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
