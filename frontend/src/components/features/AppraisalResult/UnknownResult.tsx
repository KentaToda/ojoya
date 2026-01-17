/* ═══════════════════════════════════════════════════════════════════════════
   UNKNOWN RESULT COMPONENT
   Shows retry advice when item couldn't be identified
   ═══════════════════════════════════════════════════════════════════════════ */

import { OrnateFrame } from '@/components/common/OrnateFrame';
import { Button } from '@/components/common/Button';
import type { AnalyzeResponse } from '@/types/api';
import styles from './AppraisalResult.module.css';

// ─────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────

interface UnknownResultProps {
  result: AnalyzeResponse;
  onRetry?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────

export function UnknownResult({ result, onRetry }: UnknownResultProps) {
  const { message, retry_advice } = result;

  return (
    <OrnateFrame variant="dark" size="lg">
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.headerIcon}>❌</span>
        <h2 className={styles.titleLight}>査定できませんでした</h2>
      </div>

      {/* Message */}
      {message && (
        <p className={styles.unknownMessage}>{message}</p>
      )}

      {/* Retry Advice */}
      {retry_advice && (
        <div className={styles.adviceBox}>
          <h4 className={styles.adviceTitle}>
            <span className={styles.cameraIcon}>📷</span>
            再撮影のアドバイス
          </h4>
          <p className={styles.adviceText}>{retry_advice}</p>
        </div>
      )}

      {/* Retry Button */}
      {onRetry && (
        <div className={styles.actionSection}>
          <Button
            variant="primary"
            onClick={onRetry}
            icon={<CameraIcon />}
          >
            もう一度撮影する
          </Button>
        </div>
      )}
    </OrnateFrame>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// CAMERA ICON
// ─────────────────────────────────────────────────────────────────────────

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export default UnknownResult;
