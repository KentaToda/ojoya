/* ═══════════════════════════════════════════════════════════════════════════
   STREAMING ANALYSIS HOOK
   ═══════════════════════════════════════════════════════════════════════════ */

import { useState, useCallback, useRef } from 'react';
import { createAnalysisStream } from '@/lib/streaming';
import type { AnalyzeResponse, ThinkingEvent } from '@/types/api';

// ─────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────

export interface UseStreamingAnalysisReturn {
  isLoading: boolean;
  thinkingEvents: ThinkingEvent[];
  result: AnalyzeResponse | null;
  error: string | null;
  submitImage: (imageBase64: string) => void;
  reset: () => void;
  cancel: () => void;
}

// ─────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────

export function useStreamingAnalysis(): UseStreamingAnalysisReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingEvents, setThinkingEvents] = useState<ThinkingEvent[]>([]);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cancelRef = useRef<(() => void) | null>(null);

  // Reset state
  const reset = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    setIsLoading(false);
    setThinkingEvents([]);
    setResult(null);
    setError(null);
  }, []);

  // Cancel current request
  const cancel = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    setIsLoading(false);
  }, []);

  // Submit image for analysis
  const submitImage = useCallback(
    (imageBase64: string) => {
      // Reset previous state
      reset();
      setIsLoading(true);

      const cancelFn = createAnalysisStream(imageBase64, {
        onThinking: (event) => {
          setThinkingEvents((prev) => [...prev, event]);
        },
        onComplete: (response) => {
          setResult(response);
          setIsLoading(false);
          cancelRef.current = null;
        },
        onError: (err) => {
          setError(err.message);
          setIsLoading(false);
          cancelRef.current = null;
        },
      });

      cancelRef.current = cancelFn;
    },
    [reset]
  );

  return {
    isLoading,
    thinkingEvents,
    result,
    error,
    submitImage,
    reset,
    cancel,
  };
}
