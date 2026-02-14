/* ═══════════════════════════════════════════════════════════════════════════
   ANALYSIS PROGRESS COMPONENT
   Shows AI thinking process during image analysis
   ═══════════════════════════════════════════════════════════════════════════ */

import { useState, useEffect, useRef } from 'react';
import { OrnateFrame } from '@/components/common/OrnateFrame';
import type { ThinkingEvent, NodeType } from '@/types/api';
import styles from './AnalysisProgress.module.css';

// ─────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────

export interface AnalysisProgressProps {
  isLoading: boolean;
  thinkingEvents: ThinkingEvent[];
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────

const NODE_ICONS: Record<NodeType | 'default', string> = {
  vision: '👁️',
  search: '🔍',
  price: '💰',
  default: '🤖',
};

const NODE_LABELS: Record<NodeType | 'default', string> = {
  vision: '画像解析',
  search: '商品検索',
  price: '価格調査',
  default: '処理中',
};

// ─────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────

export function AnalysisProgress({
  isLoading,
  thinkingEvents,
  className = '',
}: AnalysisProgressProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (scrollRef.current && isExpanded) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thinkingEvents, isExpanded]);

  // Don't render if no events and not loading
  if (!isLoading && thinkingEvents.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <OrnateFrame variant="dark" size="md">
        {/* Header */}
        <div className={styles.header}>
          {isLoading && (
            <span className={styles.spinner}>
              <SpinnerIcon />
            </span>
          )}
          <span className={styles.status}>
            {isLoading ? 'ojoyaが査定中...' : '分析完了'}
          </span>
        </div>

        {/* Toggle button */}
        <button
          className={styles.toggle}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          <span className={`${styles.arrow} ${isExpanded ? styles.expanded : ''}`}>
            ▶
          </span>
          AIの分析プロセスを{isExpanded ? '非表示' : '表示'}
        </button>

        {/* Thinking events */}
        {isExpanded && (
          <div className={styles.terminal} ref={scrollRef}>
            {thinkingEvents.map((event, index) => (
              <ThinkingMessage key={index} event={event} />
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className={`${styles.message} ${styles.pending}`}>
                <span className={styles.nodeIcon}>⏳</span>
                <span className={styles.typingIndicator}>
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            )}
          </div>
        )}

        {/* Hint */}
        {isLoading && (
          <p className={styles.hint}>処理には60秒〜180秒程度かかります</p>
        )}
      </OrnateFrame>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// THINKING MESSAGE
// ─────────────────────────────────────────────────────────────────────────

interface ThinkingMessageProps {
  event: ThinkingEvent;
}

function ThinkingMessage({ event }: ThinkingMessageProps) {
  const nodeKey = event.node || 'default';
  const icon = NODE_ICONS[nodeKey];
  const label = event.node ? NODE_LABELS[nodeKey] : null;

  const timestamp = new Date(event.timestamp).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const messageClass = [
    styles.message,
    event.type === 'progress' ? styles.progress : '',
    event.type === 'error' ? styles.error : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={messageClass}>
      <span className={styles.nodeIcon}>{icon}</span>
      <div className={styles.messageContent}>
        {label && <span className={styles.nodeLabel}>{label}</span>}
        <span className={styles.messageText}>{event.message}</span>
      </div>
      <span className={styles.timestamp}>{timestamp}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SPINNER ICON
// ─────────────────────────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={styles.spinnerSvg}>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />
      <path
        d="M12 2C6.477 2 2 6.477 2 12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default AnalysisProgress;
