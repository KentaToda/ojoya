/* ═══════════════════════════════════════════════════════════════════════════
   PAGE LAYOUT COMPONENT
   Main layout wrapper with header and footer
   ═══════════════════════════════════════════════════════════════════════════ */

import type { ReactNode } from 'react';
import { Header } from '../Header';
import styles from './PageLayout.module.css';

// ─────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────

export interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────

export function PageLayout({
  children,
  className = '',
  fullWidth = false,
}: PageLayoutProps) {
  const mainClasses = [
    styles.main,
    fullWidth ? styles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.layout}>
      <Header />

      <main className={mainClasses}>
        <div className={styles.content}>{children}</div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>
            <span className={styles.footerGem}>◆</span>
            Ojoya - AIの眼で隠れた宝石を見つけ出す
            <span className={styles.footerGem}>◆</span>
          </p>
          <p className={styles.footerDisclaimer}>
            ※価格はAIによる推定値です。実際の取引価格とは異なる場合があります。
          </p>
        </div>
      </footer>
    </div>
  );
}

export default PageLayout;
