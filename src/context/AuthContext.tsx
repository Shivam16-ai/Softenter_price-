import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../../shared/types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (identifier: string, password: string, portalType?: 'customer' | 'agent') => Promise<void>;
  register: (userData: any) => Promise<void>;
  registerAgent: (agentData: any) => Promise<any>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User> & { password?: string }) => Promise<void>;
  quickLoginAs: (role: UserRole) => Promise<void>;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('swiftroute_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('swiftroute_token');
      if (storedToken) {
        try {
          const res = await api.getCurrentUser();
          if (res.data) {
            setUser(res.data);
          } else {
            localStorage.removeItem('swiftroute_token');
            setToken(null);
          }
        } catch {
          localStorage.removeItem('swiftroute_token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier: string, password: string, portalType?: 'customer' | 'agent') => {
    const res = await api.login({ email: identifier, password, portalType });
    if (res.data) {
      localStorage.setItem('swiftroute_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
  };

  const register = async (userData: any) => {
    const res = await api.register(userData);
    if (res.data) {
      localStorage.setItem('swiftroute_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
  };

  const registerAgent = async (agentData: any) => {
    const res = await api.registerAgent(agentData);
    return res;
  };

  const resetPassword = async (email: string, newPassword: string) => {
    const res = await api.resetPassword({ email, new_password: newPassword });
    if (res.data) {
      localStorage.setItem('swiftroute_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('swiftroute_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User> & { password?: string }) => {
    const res = await api.updateProfile(data);
    if (res.data) {
      setUser(res.data);
    }
  };

  const quickLoginAs = async (role: UserRole) => {
    const credentials = {
      admin: { email: 'admin@swiftroute.com', password: 'admin123' },
      agent: { email: 'agent.marcus@swiftroute.com', password: 'agent123' },
      customer: { email: 'customer@swiftroute.com', password: 'customer123' },
    }[role];

    await login(credentials.email, credentials.password);
  };

  const setTokenAndFetchUser = async (newToken: string) => {
    localStorage.setItem('swiftroute_token', newToken);
    setToken(newToken);
    try {
      const res = await api.getCurrentUser();
      if (res.data) {
        setUser(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch user after setting token:', error);
      localStorage.removeItem('swiftroute_token');
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        register,
        registerAgent,
        resetPassword,
        logout,
        updateProfile,
        quickLoginAs,
        setToken: setTokenAndFetchUser,
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
