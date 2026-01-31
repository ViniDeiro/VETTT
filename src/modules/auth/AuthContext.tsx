import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Role } from '../../domain/types';

interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: '1',
    name: 'Dr. Veterinário',
    email: 'vet@example.com',
    role: 'vet' // Default to Vet for demo
  });

  const login = (role: Role) => {
    setUser({
      id: Math.random().toString(),
      name: role === 'admin' ? 'Administrador' : role === 'secretary' ? 'Secretária' : 'Dr. Veterinário',
      email: `${role}@example.com`,
      role: role
    });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
