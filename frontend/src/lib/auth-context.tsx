import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { api } from './api';
import { setAccessToken } from './tokenStore';
import { User } from './types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (identifiant: string, password: string) => Promise<void>;
  register: (data: { nom: string; prenom: string; email: string; telephone?: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadCurrentUser() {
    const res = await api.get<User>('/users/me');
    setUser(res.data);
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await api.post('/auth/refresh');
        setAccessToken(res.data.accessToken);
        await loadCurrentUser();
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(identifiant: string, password: string) {
    const res = await api.post('/auth/login', { identifiant, password });
    setAccessToken(res.data.accessToken);
    await loadCurrentUser();
  }

  async function register(data: { nom: string; prenom: string; email: string; telephone?: string; password: string }) {
    const res = await api.post('/auth/register', data);
    setAccessToken(res.data.accessToken);
    await loadCurrentUser();
  }

  async function logout() {
    await api.post('/auth/logout');
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser: loadCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit etre utilise dans un AuthProvider');
  return ctx;
}
