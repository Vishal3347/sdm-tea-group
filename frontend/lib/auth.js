'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('sdm_token');
    const userData = localStorage.getItem('sdm_user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('sdm_token', token);
    localStorage.setItem('sdm_user', JSON.stringify(user));
    setUser(user);
    router.push('/dashboard');
    return user;
  };

  const logout = () => {
    localStorage.removeItem('sdm_token');
    localStorage.removeItem('sdm_user');
    setUser(null);
    router.push('/login');
  };

  const isOwner = user?.role === 'owner';

  return (
    <AuthContext.Provider value={{ user, login, logout, isOwner, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
