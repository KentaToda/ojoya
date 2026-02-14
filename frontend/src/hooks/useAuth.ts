/* ═══════════════════════════════════════════════════════════════════════════
   AUTH HOOK
   ═══════════════════════════════════════════════════════════════════════════ */

import { useState, useEffect, useCallback } from 'react';
import {
  signInAnonymously,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';

// ─────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  isConfigured: boolean;
  signInAsAnonymous: () => Promise<User | null>;
  getIdToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign in anonymously
  const signInAsAnonymous = useCallback(async (): Promise<User | null> => {
    if (!isFirebaseConfigured()) {
      console.warn('Firebase is not configured. Cannot sign in.');
      return null;
    }

    try {
      const result = await signInAnonymously(auth);
      return result.user;
    } catch (error) {
      console.error('Anonymous sign-in failed:', error);
      throw error;
    }
  }, []);

  // Get ID token
  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!user) return null;

    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('Failed to get ID token:', error);
      return null;
    }
  }, [user]);

  // Sign out
  const signOut = useCallback(async (): Promise<void> => {
    if (!isFirebaseConfigured()) {
      return;
    }

    try {
      await auth.signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAnonymous: user?.isAnonymous ?? false,
    isConfigured: isFirebaseConfigured(),
    signInAsAnonymous,
    getIdToken,
    signOut,
  };
}
