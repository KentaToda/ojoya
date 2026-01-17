/* ═══════════════════════════════════════════════════════════════════════════
   LOADING SPINNER COMPONENT
   Medieval-themed loading animation
   ═══════════════════════════════════════════════════════════════════════════ */

import styles from './LoadingSpinner.module.css';

// ─────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────

export function LoadingSpinner({
  size = 'md',
  message,
  className = '',
}: LoadingSpinnerProps) {
  const containerClasses = [styles.container, styles[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} role="status" aria-label="Loading">
      {/* Outer ring */}
      <div className={styles.spinner}>
        <svg viewBox="0 0 100 100" className={styles.ring}>
          {/* Background ring */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            opacity="0.2"
          />
          {/* Animated ring */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="66 198"
            className={styles.ringProgress}
          />
          {/* Decorative markers */}
          <circle cx="50" cy="8" r="4" fill="currentColor" className={styles.marker} />
          <circle cx="92" cy="50" r="3" fill="currentColor" opacity="0.6" />
          <circle cx="50" cy="92" r="3" fill="currentColor" opacity="0.6" />
          <circle cx="8" cy="50" r="3" fill="currentColor" opacity="0.6" />
        </svg>

        {/* Center gem */}
        <div className={styles.gem}>
          <svg viewBox="0 0 24 24" className={styles.gemSvg}>
            <polygon
              points="12,2 20,9 17,22 7,22 4,9"
              fill="currentColor"
              className={styles.gemShape}
            />
            <polygon
              points="12,2 4,9 7,22 12,18"
              fill="currentColor"
              opacity="0.7"
            />
            <polygon
              points="12,2 12,18 17,22 20,9"
              fill="currentColor"
              opacity="0.5"
            />
          </svg>
        </div>
      </div>

      {/* Loading message */}
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}

export default LoadingSpinner;
