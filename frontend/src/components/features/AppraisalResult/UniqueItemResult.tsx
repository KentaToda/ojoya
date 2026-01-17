/* ═══════════════════════════════════════════════════════════════════════════
   UNIQUE ITEM RESULT COMPONENT
   Shows recommendation for one-of-a-kind items
   ═══════════════════════════════════════════════════════════════════════════ */

import { OrnateFrame } from '@/components/common/OrnateFrame';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import type { AnalyzeResponse } from '@/types/api';
import styles from './AppraisalResult.module.css';

// ─────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────

interface UniqueItemResultProps {
  result: AnalyzeResponse;
}

// ─────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────

export function UniqueItemResult({ result }: UniqueItemResultProps) {
  const { item_name, message, recommendation, confidence, visual_features } = result;

  const displayName = item_name || '一点物';

  return (
    <OrnateFrame variant="leather" size="lg">
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.headerIcon}>🏺</span>
        <h2 className={styles.titleLight}>一点物として判定</h2>
      </div>

      {/* Product Name */}
      <h3 className={styles.productNameLight}>{displayName}</h3>

      {/* Message */}
      {message && (
        <div className={styles.messageBox}>
          <span className={styles.warningIcon}>⚠️</span>
          <p className={styles.messageText}>{message}</p>
        </div>
      )}

      {/* Recommendation */}
      {recommendation && (
        <div className={styles.recommendationBox}>
          <span className={styles.recommendIcon}>💡</span>
          <p className={styles.recommendText}>{recommendation}</p>
        </div>
      )}

      {/* Confidence */}
      {confidence && (
        <div className={styles.confidenceSection}>
          <ConfidenceBadge
            level={confidence.level}
            reasoning={confidence.reasoning}
            size="md"
          />
        </div>
      )}

      {/* Visual Features */}
      {visual_features && visual_features.length > 0 && (
        <div className={styles.tagsSection}>
          {visual_features.map((feature, index) => (
            <span key={index} className={`${styles.tag} ${styles.tagLight}`}>
              {feature}
            </span>
          ))}
        </div>
      )}
    </OrnateFrame>
  );
}

export default UniqueItemResult;
