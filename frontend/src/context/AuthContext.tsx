'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logoutUser,
  sendResetPassword,
  getAuthErrorMessage,
} from '@/lib/auth';
import { useAuthStore } from '@/store/useAuthStore';

export interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, fullName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { login: storeLogin, logout: storeLogout } = useAuthStore();

  useEffect(() => {
    // Official Firebase Modular SDK: onAuthStateChanged is the authoritative source of truth
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        storeLogin(firebaseUser.email || 'officer@pranamap.gov.in', 'environment_officer');
      } else {
        storeLogout();
      }
    });

    return () => unsubscribe();
  }, [storeLogin, storeLogout]);

  const signIn = useCallback(async (email: string, pass: string) => {
    try {
      await loginWithEmail(email, pass);
    } catch (err) {
      throw new Error(getAuthErrorMessage(err));
    }
  }, []);

  const signUp = useCallback(async (email: string, pass: string, fullName?: string) => {
    try {
      await registerWithEmail(email, pass, fullName);
    } catch (err) {
      throw new Error(getAuthErrorMessage(err));
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      throw new Error(getAuthErrorMessage(err));
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logoutUser();
    } catch (err) {
      throw new Error(getAuthErrorMessage(err));
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendResetPassword(email);
    } catch (err) {
      throw new Error(getAuthErrorMessage(err));
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
