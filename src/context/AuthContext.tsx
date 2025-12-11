
import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { User } from '../types';
import { MOCK_USERS, MOCK_CLIENTS } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  login: (identifier: string, pass: string) => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (identifier: string, pass: string): Promise<User | null> => {
    console.log("Attempting login for:", identifier);

    // Admin Login Path
    if (identifier === '991560861') {
      if (pass === '84081447') {
        const adminUser = MOCK_USERS.find(u => u.role === 'admin');
        if (adminUser) {
          setUser(adminUser);
          return adminUser;
        }
      }
      return null;
    }

    // Entregador Login Path
    if (identifier.toLowerCase() === 'entregador') {
        if (pass === 'entrega123') {
            const entregadorUser = MOCK_USERS.find(u => u.role === 'entregador');
            if(entregadorUser) {
                setUser(entregadorUser);
                return entregadorUser;
            }
        }
        return null;
    }

    // Client/Dependent Login Path
    const normalizedIdentifier = identifier.replace(/\D/g, '');
    
    // 1. Try to find in the pre-generated MOCK_USERS list
    let foundUser = MOCK_USERS.find(u => {
        if (u.role === 'admin' || u.role === 'entregador') return false;
        
        const cleanCpf = u.cpf.replace(/\D/g, '');
        const cleanPhone = u.phone.replace(/\D/g, '');
        
        return cleanCpf === normalizedIdentifier || cleanPhone === normalizedIdentifier;
    });

    // 2. Fallback: If not found in MOCK_USERS (maybe dependent wasn't generated correctly), search deep in Clients
    if (!foundUser) {
        for (const client of MOCK_CLIENTS) {
            // Check Dependents
            if (client.dependents) {
                const dependent = client.dependents.find(d => d.cpf.replace(/\D/g, '') === normalizedIdentifier);
                if (dependent) {
                    foundUser = {
                        id: `user-dep-${dependent.id}`,
                        name: dependent.name,
                        cpf: dependent.cpf,
                        phone: client.phone,
                        role: 'dependent',
                        clientId: client.id,
                        dependentId: dependent.id
                    };
                    break;
                }
            }
        }
    }
    
    // Check password (last 4 digits of CPF)
    if (foundUser) {
        const expectedPassword = foundUser.cpf.replace(/\D/g, '').slice(-4);
        
        // Log para depuração (útil para desenvolvimento)
        console.log(`Checking password for ${foundUser.name}. Expected (last 4 CPF): ${expectedPassword}`);

        if (pass === expectedPassword) {
            setUser(foundUser);
            return foundUser;
        }
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
