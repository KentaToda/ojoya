/* ═══════════════════════════════════════════════════════════════════════════
   CONFIDENCE BADGE COMPONENT
   Shows confidence level with appropriate styling
   ═══════════════════════════════════════════════════════════════════════════ */

import type { ReactNode } from 'react';
import styles from './ConfidenceBadge.module.css';

// ─────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  reasoning?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────

function HighIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MediumIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8V12" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// LABELS
// ─────────────────────────────────────────────────────────────────────────

const LABELS: Record<ConfidenceLevel, string> = {
  high: '信頼度: 高',
  medium: '信頼度: 中',
  low: '信頼度: 低',
};

const ICONS: Record<ConfidenceLevel, () => ReactNode> = {
  high: HighIcon,
  medium: MediumIcon,
  low: LowIcon,
};

// ─────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────

export function ConfidenceBadge({
  level,
  reasoning,
  showLabel = true,
  size = 'md',
  className = '',
}: ConfidenceBadgeProps) {
  const badgeClasses = [styles.badge, styles[level], styles[size], className]
    .filter(Boolean)
    .join(' ');

  const Icon = ICONS[level];

  return (
    <div className={badgeClasses} role="status">
      <div className={styles.header}>
        <span className={styles.icon}>
          <Icon />
        </span>
        {showLabel && <span className={styles.label}>{LABELS[level]}</span>}
      </div>
      {reasoning && <p className={styles.reasoning}>{reasoning}</p>}
    </div>
  );
}

export default ConfidenceBadge;
