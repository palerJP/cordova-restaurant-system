'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode, Fragment } from 'react';
import { api, getAccessToken, setAccessToken, onSessionExpired, ApiClientError } from './api';
import type { User } from './types';
import { setActivityAccount } from './activity-history';
import { clearTastePreferences, getTastePreferences } from './taste-preferences';
import { broadcastLogout, onOtherTabLogout } from './logout-sync';

function clearLocalAccountData() {
  setActivityAccount(null);
  clearTastePreferences();
}

interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    role?: 'customer' | 'owner';
    phone?: string;
    acceptsMarketing?: boolean;
  }) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<User>;
  loginWithFacebook: (accessToken: string) => Promise<User>;
  verifyEmail: (token: string) => Promise<User>;
  devVerifyEmail: (email?: string) => Promise<User>;
  resendVerificationEmail: () => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, newPassword: string) => Promise<string>;
  updateProfile: (data: UpdateProfileData) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const setUser = useCallback((nextUser: User | null) => {
    setActivityAccount(nextUser?.id || null);
    setUserState(nextUser);
  }, []);
  const [loading, setLoading] = useState(true);
  const sessionRevision = useRef(0);
  const clearSession = useCallback(() => {
    sessionRevision.current += 1;
    setAccessToken(null);
    clearLocalAccountData();
    setUser(null);
    setLoading(false);
  }, [setUser]);

  useEffect(() => onOtherTabLogout(clearSession), [clearSession]);

  const bootstrap = useCallback(async () => {
    const revision = sessionRevision.current;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4000')}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        if (revision !== sessionRevision.current) return;
        setAccessToken(json.data.accessToken);
        setUser(json.data.user);
      } else if (res.status === 401 || res.status === 403) {
        setActivityAccount(null);
        if (getTastePreferences()?.syncedUserId) clearTastePreferences();
      }
    } catch {
      // User stays logged out
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const bootstrapped = useRef(false);
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    bootstrap();
  }, [bootstrap]);

  useEffect(() => onSessionExpired(() => {
    clearSession();
    broadcastLogout();
  }), [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const revision = sessionRevision.current;
    const res = await api.post('/api/auth/login', { email, password }, { auth: false });
    if (revision !== sessionRevision.current) throw new Error('Sign-in cancelled because the session ended.');
    sessionRevision.current += 1;
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user as User;
  }, [setUser]);

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      fullName: string;
      role?: 'customer' | 'owner';
      phone?: string;
      acceptsMarketing?: boolean;
    }) => {
      await api.post('/api/auth/register', data, { auth: false });
    },
    []
  );

  const loginWithGoogle = useCallback(async (credential: string) => {
    const revision = sessionRevision.current;
    const res = await api.post('/api/auth/google', { credential }, { auth: false });
    if (revision !== sessionRevision.current) throw new Error('Sign-in cancelled because the session ended.');
    sessionRevision.current += 1;
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user as User;
  }, [setUser]);

  const loginWithFacebook = useCallback(async (accessToken: string) => {
    const revision = sessionRevision.current;
    const res = await api.post('/api/auth/facebook', { accessToken }, { auth: false });
    if (revision !== sessionRevision.current) throw new Error('Sign-in cancelled because the session ended.');
    sessionRevision.current += 1;
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user as User;
  }, [setUser]);

  const verifyEmail = useCallback(async (token: string) => {
    const revision = sessionRevision.current;
    const res = await api.post('/api/auth/verify-email', { token }, { auth: false });
    if (res.data?.user && getAccessToken() && revision === sessionRevision.current) {
      setUser(res.data.user);
    }
    return res.data?.user as User;
  }, [setUser]);

  const devVerifyEmail = useCallback(async (email?: string) => {
    const revision = sessionRevision.current;
    const res = await api.post('/api/auth/dev-verify', { email });
    if (res.data?.user && revision === sessionRevision.current) {
      setUser(res.data.user);
    }
    return res.data?.user as User;
  }, [setUser]);

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

  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    const revision = sessionRevision.current;
    const payload: Record<string, any> = {};
    if (data.fullName !== undefined) payload.fullName = data.fullName;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.avatarUrl !== undefined) payload.avatarUrl = data.avatarUrl;

    const res = await api.patch('/api/auth/profile', payload);
    if (res.data?.user && revision === sessionRevision.current) {
      setUser(res.data.user);
    }
    return res.data?.user as User;
  }, [setUser]);

  const logout = useCallback(async () => {
    const request = api.post('/api/auth/logout');
    clearSession();
    broadcastLogout();
    const revision = sessionRevision.current;
    try {
      await request;
    } finally {
      if (revision === sessionRevision.current) clearSession();
    }
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    const revision = sessionRevision.current;
    try {
      const res = await api.get('/api/auth/me');
      if (revision === sessionRevision.current) setUser(res.data.user);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 401) {
        clearSession();
        broadcastLogout();
      }
    }
  }, [clearSession, setUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        loginWithFacebook,
        verifyEmail,
        devVerifyEmail,
        resendVerificationEmail,
        forgotPassword,
        resetPassword,
        updateProfile,
        logout,
        refreshUser,
      }}
    >
      <Fragment key={user?.id || 'guest'}>{children}</Fragment>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
