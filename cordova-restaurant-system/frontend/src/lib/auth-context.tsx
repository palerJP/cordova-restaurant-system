'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { api, setAccessToken, ApiClientError } from './api';
import type { User } from './types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { email: string; password: string; fullName: string; role?: 'customer' | 'owner'; phone?: string; acceptsMarketing?: boolean }) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<User>;
  loginWithFacebook: (accessToken: string) => Promise<User>;
  verifyEmail: (token: string) => Promise<User>;
  resendVerificationEmail: () => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, newPassword: string) => Promise<string>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        setAccessToken(json.data.accessToken);
        setUser(json.data.user);
      }
    } catch {
      // User stays logged out
    } finally {
      setLoading(false);
    }
  }, []);

  const bootstrapped = useRef(false);
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password }, { auth: false });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user as User;
  }, []);

  const register = useCallback(
    async (data: { email: string; password: string; fullName: string; role?: 'customer' | 'owner'; phone?: string; acceptsMarketing?: boolean }) => {
      await api.post('/api/auth/register', data, { auth: false });
    },
    []
  );

  const loginWithGoogle = useCallback(async (credential: string) => {
    const res = await api.post('/api/auth/google', { credential }, { auth: false });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user as User;
  }, []);

  const loginWithFacebook = useCallback(async (accessToken: string) => {
    const res = await api.post('/api/auth/facebook', { accessToken }, { auth: false });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user as User;
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    const res = await api.post('/api/auth/verify-email', { token }, { auth: false });
    if (res.data?.user) {
      setUser(res.data.user);
    }
    return res.data?.user as User;
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    await api.post('/api/auth/resend-verification');
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    const res = await api.post('/api/auth/forgot-password', { email }, { auth: false });
    return res.message || 'Password reset link dispatched.';
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    const res = await api.post('/api/auth/reset-password', { token, newPassword }, { auth: false });
    return res.message || 'Password reset successfully.';
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data.user);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 401) setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        loginWithFacebook,
        verifyEmail,
        resendVerificationEmail,
        forgotPassword,
        resetPassword,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
