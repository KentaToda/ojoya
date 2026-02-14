/* ═══════════════════════════════════════════════════════════════════════════
   HEADER COMPONENT
   Main navigation header with RPG styling
   ═══════════════════════════════════════════════════════════════════════════ */

import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

// ─────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────

export interface HeaderProps {
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────

export function Header({ className = '' }: HeaderProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`${styles.header} ${className}`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <GemIcon />
          <span className={styles.logoText}>Ojoya</span>
        </Link>

        {/* Navigation */}
        <nav className={styles.nav}>
          <Link
            to="/"
            className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
          >
            ホーム
          </Link>
          <Link
            to="/appraisal"
            className={`${styles.navLink} ${isActive('/appraisal') ? styles.active : ''}`}
          >
            査定する
          </Link>
          <Link
            to="/history"
            className={`${styles.navLink} ${isActive('/history') ? styles.active : ''}`}
          >
            履歴
          </Link>
        </nav>
      </div>

      {/* Decorative bottom border */}
      <div className={styles.borderDecoration}>
        <span className={styles.borderLine} />
        <span className={styles.borderGem}>
          <SmallGemIcon />
        </span>
        <span className={styles.borderLine} />
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────

function GemIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={styles.gemIcon}
    >
      <polygon
        points="16,2 28,12 24,30 8,30 4,12"
        fill="url(#gemGradient)"
        stroke="var(--color-gold)"
        strokeWidth="1.5"
      />
      <polygon
        points="16,2 4,12 8,30 16,24"
        fill="var(--color-gold)"
        opacity="0.3"
      />
      <polygon
        points="16,2 16,24 24,30 28,12"
        fill="var(--color-gold-dark)"
        opacity="0.5"
      />
      <defs>
        <linearGradient id="gemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-gold-light)" />
          <stop offset="100%" stopColor="var(--color-gold-dark)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SmallGemIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={styles.smallGem}>
      <polygon
        points="8,1 14,6 12,15 4,15 2,6"
        fill="var(--color-gold)"
      />
    </svg>
  );
}

export default Header;
