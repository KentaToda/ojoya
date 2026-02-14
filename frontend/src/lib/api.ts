/* ═══════════════════════════════════════════════════════════════════════════
   API CLIENT
   ═══════════════════════════════════════════════════════════════════════════ */

import { auth, isFirebaseConfigured } from './firebase';
import {
  type AppraisalDocument,
  ApiError,
} from '@/types/api';

// ─────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// ─────────────────────────────────────────────────────────────────────────
// REQUEST OPTIONS
// ─────────────────────────────────────────────────────────────────────────

interface RequestOptions {
  method?: string;
  body?: unknown;
  requireAuth?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────
// BASE REQUEST FUNCTION
// ─────────────────────────────────────────────────────────────────────────

async function getAuthToken(): Promise<string | null> {
  if (!isFirebaseConfigured() || !auth?.currentUser) {
    return null;
  }
  try {
    return await auth.currentUser.getIdToken();
  } catch {
    return null;
  }
}

async function refreshAuthToken(): Promise<string | null> {
  if (!isFirebaseConfigured() || !auth?.currentUser) {
    return null;
  }
  try {
    return await auth.currentUser.getIdToken(true);
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, requireAuth = true } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add auth token if required and available
  if (requireAuth) {
    const token = await getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;

  let response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle 401 - Token expired, try to refresh
  if (response.status === 401 && requireAuth) {
    const newToken = await refreshAuthToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    }
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: 'An error occurred' };
    }
    throw new ApiError(response.status, errorData);
  }

  return response.json();
}

// ─────────────────────────────────────────────────────────────────────────
// APPRAISAL HISTORY ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────

interface AppraisalHistoryResponse {
  appraisals: AppraisalDocument[];
  total: number;
}

export async function getAppraisalHistory(
  limit = 20,
  offset = 0
): Promise<AppraisalHistoryResponse> {
  return apiRequest<AppraisalHistoryResponse>(
    `/api/v1/appraisals?limit=${limit}&offset=${offset}`,
    {
      requireAuth: true,
    }
  );
}
