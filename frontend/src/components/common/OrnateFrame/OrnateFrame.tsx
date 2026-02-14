/* ═══════════════════════════════════════════════════════════════════════════
   ORNATE FRAME COMPONENT
   Medieval-styled decorative frame with corner ornaments
   ═══════════════════════════════════════════════════════════════════════════ */

import type { ReactNode } from 'react';
import styles from './OrnateFrame.module.css';

// ─────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────

export interface OrnateFrameProps {
  children: ReactNode;
  variant?: 'parchment' | 'leather' | 'dark' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  glow?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────

export function OrnateFrame({
  children,
  variant = 'parchment',
  size = 'md',
  className = '',
  glow = false,
}: OrnateFrameProps) {
  const frameClasses = [
    styles.frame,
    styles[variant],
    styles[size],
    glow ? styles.glow : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={frameClasses}>
      {/* Corner Ornaments */}
      <div className={`${styles.corner} ${styles.topLeft}`}>
        <CornerOrnament />
      </div>
      <div className={`${styles.corner} ${styles.topRight}`}>
        <CornerOrnament />
      </div>
      <div className={`${styles.corner} ${styles.bottomLeft}`}>
        <CornerOrnament />
      </div>
      <div className={`${styles.corner} ${styles.bottomRight}`}>
        <CornerOrnament />
      </div>

      {/* Content */}
      <div className={styles.content}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// CORNER ORNAMENT SVG
// ─────────────────────────────────────────────────────────────────────────

function CornerOrnament() {
  return (
    <svg
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.ornamentSvg}
    >
      {/* Outer decorative curve */}
      <path
        d="M2 48V12C2 6.477 6.477 2 12 2H48"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Inner decorative curve */}
      <path
        d="M8 48V16C8 11.029 11.029 8 16 8H48"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      {/* Corner flourish */}
      <circle cx="6" cy="6" r="4" fill="currentColor" />
      <circle cx="6" cy="6" r="2" fill="var(--color-stone-dark, #1E1B18)" />
      {/* Decorative dots */}
      <circle cx="16" cy="4" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="4" cy="16" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="26" cy="4" r="1" fill="currentColor" opacity="0.5" />
      <circle cx="4" cy="26" r="1" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

export default OrnateFrame;
