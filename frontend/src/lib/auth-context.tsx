import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { api } from './api';
import { setAccessToken } from './tokenStore';
import { User } from './types';

export interface GoogleLoginResult {
  requiresPhone?: boolean;
  email?: string;
  prenom?: string;
  nom?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (identifiant: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string, telephone?: string, otpCode?: string) => Promise<GoogleLoginResult | void>;
  sendWhatsAppOtp: (telephone: string) => Promise<{ devCode?: string }>;
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

  async function sendWhatsAppOtp(telephone: string) {
    const res = await api.post('/auth/send-whatsapp-otp', { telephone });
    return res.data;
  }

  async function loginWithGoogle(idToken: string, telephone?: string, otpCode?: string) {
    const res = await api.post('/auth/google', { idToken, telephone, otpCode });
    if (res.data?.requiresPhone) {
      return {
        requiresPhone: true,
        email: res.data.email,
        prenom: res.data.prenom,
        nom: res.data.nom,
      };
    }
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
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, sendWhatsAppOtp, register, logout, refreshUser: loadCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit etre utilise dans un AuthProvider');
  return ctx;
}
