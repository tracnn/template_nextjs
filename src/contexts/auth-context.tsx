'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';
import { authStorage } from '@/lib/auth-storage';
import { User, LoginResponse } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = authStorage.getAccessToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.sub, email: payload.email, full_name: payload.full_name, role: payload.role });
      } catch {
        authStorage.clear();
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiClient.post<LoginResponse>('/v1/auth/login', { email, password });
    authStorage.setTokens(data.access_token, data.refresh_token);
    const payload = JSON.parse(atob(data.access_token.split('.')[1]));
    setUser({ id: payload.sub, email: payload.email, full_name: payload.full_name, role: payload.role });
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = authStorage.getRefreshToken();
      if (refreshToken) {
        await apiClient.post('/v1/auth/logout', { refresh_token: refreshToken });
      }
    } finally {
      authStorage.clear();
      setUser(null);
    }
  }, []);

  const hasRole = useCallback((roles: string[]) => !!user && roles.includes(user.role), [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
