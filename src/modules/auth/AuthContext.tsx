import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { User, Role, AppModuleKey, ModulePermission, AccessProfile, TeamMember } from '../../domain/types';
import { mockDB } from '../../services/mockDatabase';

interface AuthContextType {
  user: User | null;
  profile: AccessProfile | null;
  teamMember: TeamMember | null;
  login: (role: Role) => void;
  logout: () => void;
  canAccess: (moduleKey: AppModuleKey, action?: keyof ModulePermission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => (
    mockDB.getCurrentUser()
  ));

  const profile = useMemo(() => (
    user ? mockDB.getProfileById(user.accessProfileId) : null
  ), [user]);

  const teamMember = useMemo(() => (
    user ? mockDB.getLinkedTeamMember(user) : null
  ), [user]);

  const login = (role: Role) => {
    setUser(mockDB.loginByRole(role));
  };

  const logout = () => {
    mockDB.logout();
    setUser(null);
  };

  const canAccess = (moduleKey: AppModuleKey, action: keyof ModulePermission = 'view') => (
    mockDB.canUserAccess(user, moduleKey, action)
  );

  return (
    <AuthContext.Provider value={{ user, profile, teamMember, login, logout, canAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
