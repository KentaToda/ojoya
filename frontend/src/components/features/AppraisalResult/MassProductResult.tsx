/* ═══════════════════════════════════════════════════════════════════════════
   MASS PRODUCT RESULT COMPONENT
   Shows price range and factors for standard products
   ═══════════════════════════════════════════════════════════════════════════ */

import { OrnateFrame } from '@/components/common/OrnateFrame';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import type { AnalyzeResponse } from '@/types/api';
import styles from './AppraisalResult.module.css';

// ─────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────

interface MassProductResultProps {
  result: AnalyzeResponse;
}

// ─────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return `¥${price.toLocaleString('ja-JP')}`;
}

function formatPriceRange(min: number, max: number): string {
  if (min === max) {
    return formatPrice(min);
  }
  return `${formatPrice(min)} 〜 ${formatPrice(max)}`;
}

// ─────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────

export function MassProductResult({ result }: MassProductResultProps) {
  const { identified_product, item_name, price, confidence, price_factors, visual_features } = result;

  const displayName = identified_product || item_name || '不明な商品';

  return (
    <OrnateFrame variant="parchment" size="lg" glow>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.headerIcon}>💎</span>
        <h2 className={styles.title}>査定完了</h2>
      </div>

      {/* Product Name */}
      <h3 className={styles.productName}>{displayName}</h3>

      {/* Price Range */}
      {price && (
        <div className={styles.priceSection}>
          <span className={styles.priceLabel}>中古相場</span>
          <span className={styles.priceValue}>
            {formatPriceRange(price.min_price, price.max_price)}
          </span>
          <p className={styles.priceMessage}>
            📊 {price.display_message}
          </p>
        </div>
      )}

      {/* Price Factors */}
      {price_factors && price_factors.length > 0 && (
        <div className={styles.factorsSection}>
          <h4 className={styles.factorsTitle}>
            <span className={styles.factorsIcon}>💡</span>
            価格に影響する要因
          </h4>
          <ul className={styles.factorsList}>
            {price_factors.map((factor, index) => (
              <li key={index} className={styles.factorItem}>
                {factor}
              </li>
            ))}
          </ul>
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
            <span key={index} className={styles.tag}>
              {feature}
            </span>
          ))}
        </div>
      )}
    </OrnateFrame>
  );
}

export default MassProductResult;
