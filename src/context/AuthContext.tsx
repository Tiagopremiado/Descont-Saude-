
import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { User } from '../types';
import { MOCK_USERS } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  login: (identifier: string, pass: string) => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (identifier: string, pass: string): Promise<User | null> => {
    // In a real app, this would be an API call
    console.log("Attempting login for:", identifier);
    const normalizedIdentifier = identifier.replace(/\D/g, '');

    const foundUser = MOCK_USERS.find(
      u => (u.cpf.replace(/\D/g, '') === normalizedIdentifier || u.phone.replace(/\D/g, '') === normalizedIdentifier)
    );
    
    // Mock password check
    if (foundUser && pass === 'password123') {
      setUser(foundUser);
      return foundUser;
    }
    
    return null;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};