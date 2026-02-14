/* ═══════════════════════════════════════════════════════════════════════════
   SSE STREAMING CLIENT
   ═══════════════════════════════════════════════════════════════════════════ */

import { auth, isFirebaseConfigured } from './firebase';
import type { AnalyzeResponse, ThinkingEvent, SSEEvent } from '@/types/api';

// ─────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// ─────────────────────────────────────────────────────────────────────────
// STREAMING CALLBACKS
// ─────────────────────────────────────────────────────────────────────────

export interface StreamingCallbacks {
  onThinking: (event: ThinkingEvent) => void;
  onComplete: (result: AnalyzeResponse) => void;
  onError: (error: Error) => void;
}

// ─────────────────────────────────────────────────────────────────────────
// PARSE SSE DATA
// ─────────────────────────────────────────────────────────────────────────

function parseSSELine(line: string): SSEEvent | null {
  if (!line.startsWith('data: ')) {
    return null;
  }

  try {
    const jsonStr = line.slice(6); // Remove 'data: ' prefix
    if (!jsonStr || jsonStr === '[DONE]') {
      return null;
    }
    return JSON.parse(jsonStr) as SSEEvent;
  } catch {
    console.warn('Failed to parse SSE data:', line);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// CREATE ANALYSIS STREAM
// ─────────────────────────────────────────────────────────────────────────

export function createAnalysisStream(
  imageBase64: string,
  callbacks: StreamingCallbacks
): () => void {
  const controller = new AbortController();

  const fetchStream = async () => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add auth token if available
      if (isFirebaseConfigured() && auth?.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
        } catch {
          // Continue without auth
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/analyze/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          image_base64: imageBase64,
          platform: 'web',
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorMessage = 'API request failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // Use default error message
        }
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          const event = parseSSELine(trimmedLine);
          if (!event) continue;

          if (event.type === 'complete') {
            callbacks.onComplete(event.result);
          } else if (event.type === 'error') {
            callbacks.onError(new Error(event.message));
          } else if (event.type !== 'node_complete') {
            callbacks.onThinking(event as ThinkingEvent);
          }
        }
      }

      // Process any remaining data in buffer
      if (buffer.trim()) {
        const event = parseSSELine(buffer.trim());
        if (event) {
          if (event.type === 'complete') {
            callbacks.onComplete(event.result);
          } else if (event.type === 'error') {
            callbacks.onError(new Error(event.message));
          } else if (event.type !== 'node_complete') {
            callbacks.onThinking(event as ThinkingEvent);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Stream was cancelled, don't report as error
        return;
      }
      callbacks.onError(
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  };

  fetchStream();

  // Return cleanup function
  return () => controller.abort();
}
