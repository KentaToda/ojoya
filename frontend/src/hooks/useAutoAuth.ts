/* ═══════════════════════════════════════════════════════════════════════════
   AUTO AUTH HOOK
   Automatically signs in anonymously if not authenticated
   ═══════════════════════════════════════════════════════════════════════════ */

import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

// ─────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────

export interface UseAutoAuthReturn {
  isReady: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

// ─────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────

export function useAutoAuth(): UseAutoAuthReturn {
  const { user, loading, isConfigured, signInAsAnonymous } = useAuth();
  const [error, setError] = useState<Error | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    // Skip if still loading, already has user, not configured, or already signing in
    if (loading || user || !isConfigured || signingIn) {
      return;
    }

    const doSignIn = async () => {
      setSigningIn(true);
      setError(null);

      try {
        await signInAsAnonymous();
      } catch (err) {
        console.error('Auto sign-in failed:', err);
        setError(err instanceof Error ? err : new Error('Failed to sign in'));
      } finally {
        setSigningIn(false);
      }
    };

    doSignIn();
  }, [loading, user, isConfigured, signInAsAnonymous, signingIn]);

  return {
    isReady: !loading && !signingIn,
    isAuthenticated: !!user,
    error,
  };
}
