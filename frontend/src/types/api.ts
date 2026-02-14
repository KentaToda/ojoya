/* ═══════════════════════════════════════════════════════════════════════════
   API TYPE DEFINITIONS
   ═══════════════════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────────────────
// ANALYZE ENDPOINT
// ─────────────────────────────────────────────────────────────────────────

export interface AnalyzeRequest {
  image_base64: string;
  user_comment?: string;
  platform?: 'web' | 'ios' | 'android';
}

export interface PriceInfo {
  min_price: number;
  max_price: number;
  currency: string;
  display_message: string;
}

export interface ConfidenceInfo {
  level: 'high' | 'medium' | 'low';
  reasoning: string;
}

export type Classification =
  | 'mass_product'
  | 'unique_item'
  | 'unknown'
  | 'prohibited';

export interface AnalyzeResponse {
  appraisal_id: string | null;
  item_name: string | null;
  identified_product: string | null;
  visual_features: string[];
  classification: Classification;
  price: PriceInfo | null;
  confidence: ConfidenceInfo | null;
  price_factors: string[] | null;
  message: string | null;
  recommendation: string | null;
  retry_advice: string | null;
}

// ─────────────────────────────────────────────────────────────────────────
// STREAMING EVENTS
// ─────────────────────────────────────────────────────────────────────────

export type ThinkingEventType =
  | 'thinking'
  | 'node_start'
  | 'node_complete'
  | 'progress'
  | 'error';

export type NodeType = 'vision' | 'search' | 'price';

export interface ThinkingEvent {
  type: ThinkingEventType;
  node?: NodeType;
  message: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface SSECompleteEvent {
  type: 'complete';
  result: AnalyzeResponse;
  timestamp: number;
}

export type SSEEvent = ThinkingEvent | SSECompleteEvent;

// ─────────────────────────────────────────────────────────────────────────
// APPRAISAL HISTORY
// ─────────────────────────────────────────────────────────────────────────

export interface VisionResult {
  category_type: 'processable' | 'unknown' | 'prohibited';
  item_name: string | null;
  visual_features: string[];
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  retry_advice?: string;
}

export interface SearchResult {
  classification: 'mass_product' | 'unique_item';
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  identified_product: string | null;
}

export interface PriceResult {
  status: 'complete' | 'error';
  min_price: number;
  max_price: number;
  currency: 'JPY';
  confidence: 'high' | 'medium' | 'low';
  display_message: string;
  price_factors?: string[];
}

export type OverallStatus =
  | 'completed'
  | 'incomplete'
  | 'error'
  | 'pending_reappraisal';

export type TerminationPoint =
  | 'vision_prohibited'
  | 'vision_unknown'
  | 'search_unique'
  | 'price_complete'
  | 'price_error';

export interface AppraisalDocument {
  id: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
  user_comment?: string;
  vision: VisionResult;
  search?: SearchResult;
  price?: PriceResult;
  overall_status: OverallStatus;
  termination_point: TerminationPoint;
}

// ─────────────────────────────────────────────────────────────────────────
// API ERROR
// ─────────────────────────────────────────────────────────────────────────

export interface ApiErrorResponse {
  detail: string;
  status_code?: number;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly detail: string;

  constructor(status: number, response: ApiErrorResponse) {
    super(response.detail || 'An error occurred');
    this.name = 'ApiError';
    this.status = status;
    this.detail = response.detail || 'An error occurred';
  }
}
