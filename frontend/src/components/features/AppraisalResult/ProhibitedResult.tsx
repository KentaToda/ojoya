/* ═══════════════════════════════════════════════════════════════════════════
   PROHIBITED RESULT COMPONENT
   Shows warning for prohibited content
   ═══════════════════════════════════════════════════════════════════════════ */

import { OrnateFrame } from '@/components/common/OrnateFrame';
import { Button } from '@/components/common/Button';
import type { AnalyzeResponse } from '@/types/api';
import styles from './AppraisalResult.module.css';

// ─────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────

interface ProhibitedResultProps {
  result: AnalyzeResponse;
  onRetry?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────

export function ProhibitedResult({ result, onRetry }: ProhibitedResultProps) {
  const { message } = result;

  return (
    <OrnateFrame variant="dark" size="lg">
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.headerIcon}>⛔</span>
        <h2 className={styles.titleError}>この画像は査定対象外です</h2>
      </div>

      {/* Message */}
      <div className={styles.prohibitedMessage}>
        <p>{message || '商品のみが写った画像を使用してください'}</p>
      </div>

      {/* Guidelines */}
      <div className={styles.guidelinesBox}>
        <h4 className={styles.guidelinesTitle}>査定できない画像</h4>
        <ul className={styles.guidelinesList}>
          <li>人物の顔が写っている画像</li>
          <li>個人情報が含まれる画像（マイナンバーカード、免許証、口座情報など）</li>
          <li>動物が写っている画像</li>
          <li>現金・カード類が写っている画像</li>
          <li>商品が特定できない画像</li>
        </ul>
      </div>

      {/* Retry Button */}
      {onRetry && (
        <div className={styles.actionSection}>
          <Button
            variant="primary"
            onClick={onRetry}
            icon={<ImageIcon />}
          >
            別の画像を選択する
          </Button>
        </div>
      )}
    </OrnateFrame>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// IMAGE ICON
// ─────────────────────────────────────────────────────────────────────────

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

export default ProhibitedResult;
